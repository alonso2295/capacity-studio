## Why

El módulo de asignaciones permite consultar información operativa, pero actualmente no ofrece una forma de llevar los resultados fuera de la aplicación. Esto obliga a copiar datos manualmente y dificulta compartir reportes; una descarga Excel filtrada permitirá obtener rápidamente un conjunto consistente y reutilizable de asignaciones.

## What Changes

- Agregar una acción visible en el módulo de asignaciones para descargar un archivo Excel (.xlsx).
- Aplicar al archivo todos los filtros activos del listado, incluyendo búsqueda, proveedor, rol, Squad Asignado, rango de fechas y estado de renuncia.
- Exportar todas las asignaciones que coincidan con los filtros, independientemente de la página visible o del tamaño de página seleccionado.
- Generar las columnas en el orden solicitado: DNI, Nombre Completo, Proveedor, Rol, Squad Asignado, Proyecto, Fecha Inicio, Fecha Fin y % asignado.
- Usar Planilla como proveedor cuando la asignación no tenga proveedor registrado.
- Mostrar estados de carga y error para la descarga sin alterar el listado actual.

## Capabilities

### New Capabilities

- assignment-export: descarga de asignaciones filtradas en formato Excel con columnas, orden y valores definidos.

### Modified Capabilities

- Ninguna. No existen especificaciones principales registradas para modificar; los requisitos de filtros y paginación existentes se conservan.

## Impact

- Frontend: apps/web/components/assignments.tsx y apps/web/lib/api.ts para la acción de descarga y el envío de filtros.
- Backend: endpoint de exportación en apps/api/app/routes.py, reutilizando la autorización y las consultas del listado de asignaciones.
- Pruebas: escenarios E2E de apps/web/tests/e2e/assignments.spec.ts y pruebas API en apps/api/tests/test_assignments.py.
- Dependencias: será necesario incorporar o seleccionar una biblioteca para generar .xlsx; no se anticipan cambios de modelo ni migraciones de base de datos.
