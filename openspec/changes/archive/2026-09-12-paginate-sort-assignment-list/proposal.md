## Why

El listado de asignaciones puede crecer rápidamente y actualmente carga todos los registros en una sola tabla, lo que dificulta recorrerlos y comparar información. Además, los usuarios necesitan ordenar la tabla por cualquiera de sus columnas relevantes y decidir explícitamente el periodo que desean consultar.

## What Changes

- Paginar el listado de asignaciones en la vista tabla, con navegación entre páginas y tamaño de página visible.
- Permitir ordenar los registros desde las columnas de la tabla, indicando visualmente la columna y dirección activa.
- Mantener vacíos los campos de filtro `Fecha inicio` y `Fecha fin` al abrir el módulo.
- Restaurar los campos de fecha vacíos al seleccionar `Limpiar filtros`.
- Mantener los filtros seleccionados al cambiar de página u ordenar, y reiniciar la página cuando cambien los criterios de filtrado.
- Mantener la vista de cards y sus filtros existentes sin imponerle paginación de tabla.

## Capabilities

### New Capabilities

- `assignment-list-controls`: paginación, ordenamiento de columnas y periodo trimestral predeterminado para el listado de asignaciones.

### Modified Capabilities

- Ninguna.

## Impact

- **Backend:** extender la consulta de asignaciones para recibir página, tamaño de página, columna de ordenamiento y dirección, y devolver metadatos de paginación junto con los registros.
- **Frontend:** actualizar tipos, API, filtros y tabla de asignaciones con controles de paginación y encabezados ordenables.
- **Base de datos:** no se requieren nuevas tablas ni migraciones; el ordenamiento y paginación utilizarán las columnas existentes.
- **Compatibilidad:** la vista de cards continuará usando los mismos filtros y deberá consumir el resultado de forma consistente con la vista tabla.
- **Pruebas:** cubrir límites de página, orden ascendente/descendente, filtros persistentes, fechas vacías al iniciar y limpiar, estados vacíos y comportamiento responsive.
