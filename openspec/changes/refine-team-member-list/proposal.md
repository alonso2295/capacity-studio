## Why

El listado actual de miembros requiere recorrer todos los registros y no permite
encontrarlos rápidamente por sus datos principales. Además, las acciones de la
tabla ocupan espacio y el listado no escala bien cuando crece el equipo.

## What Changes

- Agregar búsqueda por nombre completo o DNI.
- Agregar filtros por proveedor y rol profesional, manteniendo el filtro de estado existente.
- Permitir ordenar el listado por sus columnas mediante controles accesibles en los encabezados.
- Incorporar paginación con tamaño de página configurable y navegación entre páginas.
- Reemplazar los textos de las acciones Editar y Desactivar/Reactivar por botones con iconos, conservando etiquetas accesibles y la confirmación de desactivación.
- Mantener la desactivación como eliminación lógica y conservar la opción de reactivar miembros inactivos.

## Capabilities

### New Capabilities

- `team-member-list-management`: búsqueda, filtrado, ordenamiento, paginación y acciones de estado para el listado de miembros.

### Modified Capabilities

<!-- No existing main capability specs are present under openspec/specs/. -->

## Impact

- Frontend: página y componente del listado de miembros, cliente API, tipos y pruebas Playwright.
- Backend: endpoint de listado de miembros para aceptar filtros, ordenamiento y parámetros de paginación, con respuesta paginada compatible con el alcance de autorización existente.
- Persistencia: consultas SQLAlchemy sobre miembros, proveedor y rol; no se eliminan registros ni se requieren cambios de modelo.
- La vista de detalle, edición, registro y la semántica de desactivación/reactivación deben continuar funcionando.
