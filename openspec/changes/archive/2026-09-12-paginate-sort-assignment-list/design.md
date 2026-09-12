## Context

La API actual de asignaciones devuelve una lista completa y ordena internamente por fecha de inicio descendente. La pantalla de asignaciones mantiene filtros en estado local, usa la misma respuesta para tabla y cards y actualmente renderiza todos los registros recibidos. La tabla contiene datos de miembro, proveedor, renuncia, rol, ambos Squads, proyecto, periodo, porcentaje y acciones.

El cambio debe conservar la autorización `Chapter Lead`, utilizar PostgreSQL/Supabase para filtrar, ordenar y paginar, y respetar la guía responsive del sistema de diseño.

## Goals / Non-Goals

**Goals:**

- Hacer que la API entregue una página estable con metadatos de navegación.
- Ordenar en backend antes de aplicar `offset`/`limit`, incluyendo columnas derivadas de relaciones.
- Mantener vacíos los filtros de fechas al iniciar y restablecerlos, aplicando intersección inclusiva cuando el usuario los complete.
- Mantener consistencia entre filtros, tabla y cards sin añadir paginación visual a cards.

**Non-Goals:**

- No modificar reglas de capacidad, CRUD, autorización ni el modelo de asignaciones.
- No crear migraciones ni nuevas tablas.
- No añadir ordenamiento a la vista cards como una interacción independiente.

## Decisions

### Contrato paginado

El endpoint existente `GET /api/v1/assignments` recibirá `page` (por defecto `1`), `page_size` (por defecto `20`, máximo `100`), `sort_by` y `sort_direction` (por defecto `start_date` y `desc`). Responderá un objeto con `items`, `total`, `page`, `page_size` y `total_pages`.

Las columnas soportadas serán las columnas visibles: `member_full_name`, `member_dni`, `vendor_name`, `member_resigned`, `professional_role_name`, `assigned_squad_name`, `executor_squad_name`, `project_code`, `start_date`, `end_date` y `allocation_percentage`. La API mapeará cada clave a una expresión SQLAlchemy segura, sin aceptar nombres de columna arbitrarios. El desempate final será por `Assignment.id` ascendente.

**Alternativa descartada:** paginar o ordenar únicamente en el navegador. Se descarta porque exigiría cargar todos los registros y produciría páginas inconsistentes a medida que el volumen crezca.

### Estado inicial de fechas

El frontend iniciará `start_date` y `end_date` como cadenas vacías y no calculará el trimestre actual. `Limpiar filtros` restaurará ambos campos vacíos. Cuando el usuario ingrese uno o ambos límites, el backend continuará aplicando las condiciones inclusivas existentes, por lo que la asignación que toque cualquiera de los límites será incluida.

### Estado de consulta

La clave de TanStack Query incluirá filtros, página, tamaño de página, columna y dirección. Cualquier cambio de filtro u ordenamiento establecerá `page = 1`; cambiar de página no modificará filtros ni orden. Los controles de tabla mostrarán el rango de resultados y deshabilitarán los límites.

La vista cards consumirá los mismos filtros, solicitando el tamaño máximo permitido para conservar su presentación actual sin controles de paginación. La tabla consumirá la página seleccionada y mostrará los metadatos recibidos.

### Encabezados ordenables y accesibilidad

Cada encabezado ordenable será un botón dentro de la celda `th`, con `aria-sort` en el encabezado activo y una etiqueta que indique columna y dirección. Los indicadores no dependerán únicamente de color. En móvil se conservará el desplazamiento interno de la tabla existente y los controles de paginación permanecerán utilizables con teclado.

### Pruebas

El backend probará total, límites, orden ascendente/descendente, desempate, filtros inclusivos y validaciones. Playwright probará las fechas vacías al abrir y limpiar filtros, navegación, ordenamiento, cambio de tamaño, filtros persistentes, cambio tabla/cards y overflow móvil.

## Risks / Trade-offs

- **[Riesgo]** El contrato deja de devolver una lista simple y puede afectar consumidores existentes. → **Mitigación:** actualizar el único cliente frontend y sus pruebas en el mismo cambio; documentar el objeto `items` como contrato vigente.
- **[Riesgo]** Ordenar por nombres relacionados puede requerir joins adicionales. → **Mitigación:** reutilizar joins explícitos y un mapa cerrado de expresiones ordenables.
- **[Riesgo]** La vista cards con el tamaño máximo puede no mostrar más registros que el límite configurado. → **Mitigación:** conservar el máximo documentado y dejar la paginación como alcance exclusivo de la tabla.
- **[Riesgo]** La consulta inicial sin fechas puede devolver un volumen mayor de asignaciones. → **Mitigación:** conservar la paginación de tabla y los filtros explícitos para acotar el resultado.

## Migration Plan

1. Actualizar esquemas y consulta de asignaciones con el contrato paginado.
2. Actualizar API client, estado de filtros y tabla frontend.
3. Añadir pruebas backend y Playwright.
4. Desplegar frontend y backend coordinadamente; no se requiere migración de datos.

El rollback consiste en revertir el endpoint y el cliente al contrato de lista anterior si un consumidor externo no actualizado lo requiere.
