## Why

Capacity Studio necesita un catálogo centralizado de Squads para que los futuros flujos de asignación trabajen con equipos válidos y consistentes. Actualmente no existe una forma de registrar ni mantener la información básica de los Squads.

## What Changes

- Crear la capacidad `squads` para registrar y administrar Squads desde una interfaz web responsive.
- Implementar un CRUD completo: listado, detalle, creación, edición y cambio de estado.
- Registrar únicamente el código del Squad, nombre del Squad, tribu y nombre del PO del Squad.
- Validar el código como texto alfanumérico, normalizado y único sin distinguir mayúsculas de minúsculas.
- Hacer obligatorio únicamente el código y el nombre del Squad; tribu y PO serán opcionales.
- Implementar la eliminación como desactivación lógica, conservando el registro para trazabilidad y permitiendo su reactivación.
- Restringir la administración al rol `Chapter Lead`, siguiendo el patrón de los catálogos administrativos existentes.
- Persistir los datos en PostgreSQL sobre Supabase mediante la API del backend; el navegador no accederá directamente a la base de datos.
- Aplicar el sistema visual definido en `docs/design-system.md`.

## Capabilities

### New Capabilities

- `squads`: Registro y administración del catálogo de Squads activos e inactivos.

### Modified Capabilities

- Ninguna. Esta propuesta introduce una capacidad nueva.

## Impact

- **Frontend:** Nueva sección responsive en Next.js para listado, detalle, alta, edición y activación/desactivación de Squads.
- **Backend:** Nuevos esquemas y endpoints REST protegidos por rol en FastAPI bajo `/api/v1/squads`.
- **Base de datos:** Nueva entidad `squads` con código único, datos descriptivos, estado y timestamps; la desactivación no eliminará datos.
- **Autorización:** Solo `Chapter Lead` podrá administrar el catálogo.
- **Pruebas:** Validaciones de código y campos obligatorios, unicidad, permisos, CRUD, desactivación lógica, reactivación y responsive.
- **Supabase:** La persistencia se realizará a través de la conexión PostgreSQL del backend configurada para Supabase.
