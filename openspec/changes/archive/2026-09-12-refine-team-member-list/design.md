## Context

La página `/members` consulta actualmente `GET /api/v1/members?status=...` y
recibe un arreglo completo. El backend ordena únicamente por apellido paterno y
nombre, mientras que el frontend renderiza todos los resultados en una tabla y
usa enlaces y texto para las acciones. Los módulos de asignaciones ya establecen
un patrón de consulta server-side con `page`, `page_size`, `sort_by` y
`sort_direction`, junto con controles de tabla y paginación accesibles.

## Goals / Non-Goals

**Goals:**

- Extender la consulta de miembros para filtrar, ordenar y paginar en el backend.
- Mantener la autorización existente y la desactivación lógica.
- Reutilizar el contrato de paginación y los patrones visuales del listado de asignaciones.
- Mantener el flujo existente de detalle, edición, desactivación y reactivación.
- Cubrir el nuevo comportamiento con pruebas de API y Playwright, incluyendo móvil y accesibilidad básica.

**Non-Goals:**

- No cambiar el modelo de datos, las migraciones de Supabase ni las reglas de negocio del formulario de miembros.
- No cambiar la semántica de estado ni convertir la desactivación en eliminación física.
- No agregar exportación, vista de cards ni filtros adicionales fuera de búsqueda, proveedor, rol y estado.

## Decisions

### Contrato paginado del endpoint

`GET /api/v1/members` aceptará `status`, `search`, `vendor_id`,
`professional_role_id`, `page`, `page_size`, `sort_by` y `sort_direction`.
Responderá con `{ items, total, page, page_size, total_pages }`, siguiendo el
contrato ya utilizado por asignaciones. `page` iniciará en 1 y `page_size`
permitirá 20, 50 o 100 desde la interfaz, con validación superior en la API.

Se elige paginación server-side sobre paginar el arreglo en el navegador para
evitar transferir todos los miembros y para que filtros y ordenamiento sean
correctos con grandes volúmenes.

### Consulta y ordenamiento del backend

La consulta se construirá con una lista blanca de expresiones de ordenamiento
para evitar aceptar nombres de columnas arbitrarios. Las columnas disponibles
serán nombre completo, DNI, tipo de vínculo, proveedor, rol profesional,
seniority y estado. El nombre se ordenará por una expresión consistente con el
nombre que se muestra; los proveedores nulos se tratarán de forma determinista.
`TeamMember.id` se agregará como desempate estable antes de aplicar `offset` y
`limit`.

La búsqueda usará coincidencia parcial case-insensitive sobre DNI y el nombre
completo (nombre y ambos apellidos). Proveedor, rol y estado se añadirán como
predicados AND. Los joins necesarios se realizarán únicamente en la consulta;
la serialización seguirá devolviendo el mismo detalle de miembro y afiliaciones.

### Estado y filtros en el frontend

El componente mantendrá un estado único de filtros y otro de opciones de
consulta. La búsqueda se aplicará con un debounce corto para no generar una
solicitud por cada tecla; los selects aplicarán el cambio inmediatamente.
Cualquier cambio de filtro, orden o tamaño de página establecerá la página en
1. El cambio de página conservará todos los demás parámetros.

Los catálogos existentes de proveedores y roles alimentarán los filtros. El
filtro de estado conservará `Activos` como valor inicial y las opciones
`Inactivos` y `Todos`.

### Tabla, acciones e iconos

Se reutilizará el patrón `SortableHeader` de asignaciones para emitir
`aria-sort`, el orden siguiente y un indicador visual. La tabla conservará sus
columnas actuales y no hará ordenable la columna Acciones.

Editar será un enlace-botón visual de icono que navega a la ruta actual de
edición. La acción de estado será un botón de icono con `aria-label` y `title`
dinámicos (`Desactivar miembro` o `Reactivar miembro`). Se usarán SVG inline
para evitar una dependencia nueva y se conservarán las dimensiones táctiles,
foco visible y estados disabled del sistema de diseño. La confirmación existente
se mantendrá antes de desactivar.

### Paginación y estados de interfaz

La tabla mostrará el rango `Mostrando X–Y de Z`, tamaño de página, página actual,
total de páginas y botones anterior/siguiente. Los botones se deshabilitarán en
los extremos. Loading, error y estado vacío seguirán siendo explícitos; durante
una actualización se evitarán acciones duplicadas.

En móvil, la tabla conservará el desplazamiento horizontal dentro de su propio
contenedor, mientras que filtros y paginación podrán envolver en varias líneas
sin producir overflow del documento.

### Verificación

- Backend: pruebas unitarias de filtros combinados, búsqueda por nombre/DNI,
  orden permitido, paginación y metadatos.
- Frontend E2E: búsqueda y filtros, orden ascendente/descendente, navegación y
  cambio de tamaño de página, acciones de icono y confirmación de desactivación,
  reactivación y ausencia de overflow móvil.
- Calidad: typecheck, lint y build de la aplicación web; pytest y herramientas
  de calidad del API según los scripts existentes.

## Risks / Trade-offs

- [Riesgo] Cambiar la respuesta de lista a objeto paginado puede afectar consumidores adicionales del endpoint → actualizar el cliente web y sus tipos en el mismo cambio, y verificar usos con búsqueda global y pruebas API.
- [Riesgo] Una búsqueda por nombre completo puede variar según reglas de concatenación y acentos de la base de datos → usar comparación case-insensitive sobre cada componente del nombre además del DNI y cubrir nombres con apellidos en pruebas.
- [Riesgo] Los iconos solos reducen la comprensión visual si faltan nombres accesibles → mantener `aria-label`, `title`, foco visible y pruebas que consulten los nombres accesibles.
- [Trade-off] La paginación server-side agrega parámetros y metadatos al contrato, pero evita transferencias grandes y garantiza que filtros y orden coincidan con los datos mostrados.
