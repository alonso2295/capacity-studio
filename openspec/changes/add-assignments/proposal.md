## Why

Capacity Studio necesita registrar cómo se distribuye la capacidad de cada miembro entre los Squads y proyectos donde presta servicios. Sin un módulo de asignaciones, no hay una vista confiable de la ocupación por persona, ni una forma de conservar el proveedor, rol y seniority vigentes al momento de asignar.

## What Changes

- Crear la capacidad `assignments` para registrar y consultar asignaciones de miembros a Squads.
- Permitir crear, consultar, editar y eliminar asignaciones individuales.
- Incluir miembro, sus datos informativos cargados automáticamente, Squad Asignado, Squad Ejecutor, código de proyecto, rango de fechas y porcentaje de asignación.
- Establecer por defecto el Squad Ejecutor igual al Squad Asignado; permitir elegir un ejecutor diferente y conservar ambos valores de forma independiente después de esa selección explícita.
- Persistir en cada asignación el proveedor vigente del miembro al momento de crearla, sin recalcularlo si el miembro cambia de proveedor posteriormente.
- Permitir varias asignaciones simultáneas por miembro, validando que la suma de porcentajes de asignaciones activas con fechas superpuestas no supere el 100% para ninguna fecha.
- Implementar búsqueda por nombre o DNI y filtros por proveedor, rol, Squad Asignado, fecha de inicio y fecha de fin en la vista tabular y en la vista de cards; los filtros de fecha serán inclusivos.
- Mostrar una vista de cards minimalista con subpestañas `Squad Asignado` y `Squad Ejecutor`, conservando los mismos filtros de la tabla, actualizando el agrupamiento y el resumen agregado de perfiles por rol según la pestaña activa y omitiendo los códigos y ambos nombres de Squad dentro de cada card. Las subpestañas y los encabezados de agrupación conservarán la perspectiva activa.
- Abrir el alta y la edición mediante una ventana/modal accesible, con búsqueda de colaboradores y carga automática de sus datos.
- Restringir la administración al rol `Chapter Lead`, siguiendo el patrón de los módulos administrativos existentes.
- Persistir los datos en PostgreSQL sobre Supabase mediante la API del backend; el navegador no accederá directamente a la base de datos.
- Aplicar el sistema visual definido en `docs/design-system.md` y mantener comportamiento responsive.

## Capabilities

### New Capabilities

- `assignments`: Registro, edición, eliminación, consulta y visualización tabular/card de las asignaciones de miembros a Squads y proyectos.

### Modified Capabilities

- Ninguna. Esta propuesta introduce una capacidad nueva.

## Impact

- **Frontend:** Nueva sección responsive para listado tabular, vista de cards, filtros y modal de alta/edición de asignaciones.
- **Backend:** Nueva entidad, esquemas, validaciones de solapamiento y endpoints REST protegidos por rol en FastAPI bajo `/api/v1/assignments`.
- **Base de datos:** Nueva tabla de asignaciones con referencias a miembro, Squad Asignado, Squad Ejecutor y proveedor capturado; fechas, porcentaje y código de proyecto. Los registros existentes deberán conservar su Squad actual en ambos campos.
- **Catálogos:** Los formularios consumirán miembros, proveedores, roles y Squads activos; la información del proveedor quedará congelada dentro de la asignación.
- **Autorización:** Solo `Chapter Lead` podrá consultar y administrar las asignaciones.
- **Pruebas:** Validación de rango porcentual, fechas, sumatoria máxima del 100%, búsqueda/filtros incluyendo Squad Asignado y rangos de fecha inclusivos, CRUD, valores por defecto e independencia de ambos Squads, captura histórica del proveedor, modal, subpestañas y resumen de roles en cards y responsive.
- **Supabase:** La persistencia se realizará a través de la conexión PostgreSQL del backend configurada para Supabase.
