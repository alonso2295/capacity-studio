## Context

El dashboard `/metrics` ya consulta un trimestre y devuelve KPIs, agrupaciones
de roles y proveedores. Las asignaciones ya tienen ambos
Squads, proveedor capturado, proyecto, porcentaje y marca de renuncia. El
componente de gestión de asignaciones contiene un patrón de cards con dos
perspectivas, pero el dashboard de métricas aún no expone asignaciones
individuales ni filtros operativos.

## Goals / Non-Goals

**Goals:**

- Extender la respuesta del dashboard con opciones de filtro y asignaciones operativas filtradas.
- Mantener las métricas ejecutivas existentes independientes de proveedor, rol y Squad Asignado.
- Reutilizar el lenguaje visual de las cards de asignaciones, con una estructura compacta y minimalista.
- Permitir una selección múltiple accesible de Squads Asignados y dos perspectivas de agrupación.
- Mantener acceso a las opciones y cards para cualquier usuario autenticado autorizado a ver métricas.

**Non-Goals:**

- No agregar edición, eliminación ni acciones sobre asignaciones desde métricas.
- No mostrar DNI, fechas, seniority, Squad Asignado ni acciones dentro de cada card.
- No paginar las cards en esta primera versión; la consulta devolverá el conjunto filtrado del trimestre.
- No modificar la vista de cards del módulo de gestión de asignaciones.
- No cambiar el cálculo de los KPIs existentes salvo para añadir el nuevo bloque de respuesta.

## Decisions

### Contrato consolidado del dashboard

Se extenderá `GET /api/v1/metrics/dashboard` con los parámetros opcionales
`vendor_id`, `professional_role_id` y múltiples `assigned_squad_id`. Los IDs de
Squad se enviarán como parámetros repetidos para conservar una URL estándar y
permitir una lista vacía sin valores especiales.

La respuesta agregará:

- `assignment_filter_options`: proveedores, roles y Squads activos disponibles para los filtros.
- `assignment_cards`: asignaciones operativas del periodo con ID, nombre, rol, proveedor, proyecto, porcentaje y los IDs/nombres de ambos Squads necesarios para agrupar.

Los campos de identificación de Squads existirán en el contrato para la lógica
de agrupación, pero la interfaz no los renderizará dentro de la card salvo el
nombre del grupo fuera de ella. La respuesta consolidada evita lecturas
inconsistentes entre las métricas actuales y las cards.

### Alcance de filtros

El año y trimestre seguirán controlando todo el dashboard. Proveedor, rol y
Squad Asignado filtrarán únicamente `assignment_cards`; los KPIs, la
distribución ejecutiva y la tabla proveedor/rol continuarán representando el
periodo completo, como en la versión actual.

La consulta de opciones se realizará dentro del endpoint de métricas, protegido
por la autorización general de usuario autenticado. No se reutilizarán los
endpoints administrativos de catálogos para evitar que la pantalla falle para
usuarios que no sean Chapter Lead.

### Reglas de selección de asignaciones

El backend reutilizará la condición inclusiva de intersección con el trimestre.
Para las cards solo se incluirán asignaciones cuyo miembro esté activo y
`member_resigned` sea falso. El proveedor se leerá de `assignment.vendor` y se
mostrará `Planilla` cuando sea nulo; el rol se leerá del miembro asociado.

La selección de uno o más Squads será un predicado `IN` sobre
`assigned_squad_id`. Sin selección se omite el predicado. El resultado se
ordenará de manera estable por nombre del Squad Asignado, nombre del miembro e
identificador de asignación.

### Agrupación frontend y cards

El estado de TanStack Query incluirá año, trimestre, proveedor, rol y arreglo
de Squads seleccionados. El cambio de cualquier filtro volverá a consultar las
cards; el cambio de perspectiva solo reagrupará el resultado ya cargado.

Se implementará un selector desplegable con checkboxes, opción para limpiar la
selección y un resumen accesible de cantidad seleccionada. Los grupos se
formarán por `assigned_squad_id` o `executor_squad_id` según la perspectiva.
Cada grupo mostrará su nombre y un resumen compacto de roles; cada card
contendrá únicamente:

- Nombre completo.
- Rol.
- Proveedor.
- Proyecto.
- Capacidad asignada.
- Squad Ejecutor.

No habrá acciones ni enlaces en las cards porque la pantalla es de consulta.
El diseño minimalista usará menor padding, tipografía compacta, bordes y
sombras sutiles, y una jerarquía clara entre el nombre y los metadatos. Los
metadatos se organizarán de forma densa pero legible, evitando bloques altos y
espacios vacíos innecesarios. Se conservarán los radios, contraste y tamaños
táctiles de `docs/design-system.md`, con una columna en móvil y dos o más en
pantallas grandes.

### Estados y accesibilidad

La sección tendrá estados de carga, error y vacío independientes del resto del
dashboard para que una respuesta sin cards no oculte las métricas. Las tabs de
perspectiva usarán `role="tablist"`, `aria-selected` y foco visible. El selector
multiselección tendrá nombre accesible, checkboxes etiquetados y una lectura
del número de elementos activos. No se dependerá únicamente del color para
comunicar estado.

## Risks / Trade-offs

- [Riesgo] Devolver todas las asignaciones de un trimestre puede crecer más que las agregaciones existentes → Mitigación: seleccionar solo campos necesarios, aplicar filtros en SQL y ordenar de forma estable; evaluar paginación si el volumen real lo requiere.
- [Riesgo] Los endpoints administrativos de catálogos no están disponibles para todos los usuarios → Mitigación: incluir opciones activas en la respuesta de métricas autorizada por usuario autenticado.
- [Riesgo] Una misma asignación aparece en grupos distintos al cambiar de perspectiva → Mitigación: conservar el mismo ID y conjunto filtrado, cambiando solamente la clave de agrupación.
- [Riesgo] Un card puede mostrar datos de un proveedor capturado distinto al actual del miembro → Mitigación: usar explícitamente el proveedor persistido en la asignación, igual que las métricas actuales.

## Migration Plan

1. Agregar los esquemas de opciones y cards y extender el endpoint existente sin cambios de base de datos.
2. Cubrir la consulta inclusiva, filtros múltiples, exclusión de renuncias y acceso general con pruebas API.
3. Incorporar filtros, selector multiselección, tabs y cards en el dashboard.
4. Verificar estados vacíos, responsive, accesibilidad y regresión de las métricas existentes.

No se requieren migraciones Alembic ni cambios de datos. El rollback consiste en
retirar los campos adicionales del contrato y ocultar la sección de cards.
