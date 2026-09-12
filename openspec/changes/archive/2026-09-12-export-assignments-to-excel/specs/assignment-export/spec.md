## Purpose

Permitir que las personas autorizadas descarguen un reporte Excel de las asignaciones encontradas, conservando los filtros activos y un formato de columnas estable para análisis y distribución.

## ADDED Requirements

### Requirement: Exportar asignaciones aplicando los filtros activos

El sistema SHALL ofrecer una acción de descarga Excel en el módulo de asignaciones. La exportación SHALL aplicar los mismos filtros activos del listado: búsqueda por DNI o nombre, proveedor, rol, Squad Asignado, fecha de inicio, fecha de fin y estado de renuncia. La exportación SHALL incluir todas las asignaciones coincidentes, sin limitarse a la página o al tamaño de página visibles, y SHALL conservar la autorización vigente del módulo.

#### Scenario: Descargar resultados filtrados

- **WHEN** una persona autorizada aplica uno o más filtros y activa la descarga Excel
- **THEN** el sistema descarga un archivo XLSX que contiene todas las asignaciones que cumplen esos filtros
- **AND** ninguna asignación que cumpla los filtros queda fuera por la paginación del listado

#### Scenario: Descargar sin filtros

- **WHEN** una persona autorizada activa la descarga sin filtros
- **THEN** el archivo contiene todas las asignaciones a las que esa persona tiene acceso

#### Scenario: Mantener la semántica de fechas

- **WHEN** se descarga con fecha de inicio, fecha de fin o ambas
- **THEN** se aplican las mismas reglas de intersección inclusiva del listado

### Requirement: Mantener el orden y los nombres de las columnas

El archivo SHALL contener una fila de encabezados con exactamente estas columnas y en este orden: DNI, Nombre Completo, Proveedor, Rol, Squad Asignado, Proyecto, Fecha Inicio, Fecha Fin y % asignado. Cada fila SHALL representar una asignación y SHALL usar el DNI, nombre completo, proveedor, rol, Squad Asignado, proyecto, fechas y porcentaje correspondientes a esa asignación. Cuando el proveedor sea nulo, SHALL mostrar Planilla.

#### Scenario: Validar estructura del archivo

- **WHEN** se abre un archivo generado con al menos una asignación
- **THEN** la primera fila contiene los nueve encabezados solicitados en el orden definido
- **AND** cada fila posterior contiene los datos de una asignación bajo la columna correspondiente

#### Scenario: Exportar una asignación de planilla

- **WHEN** una asignación no tiene proveedor registrado
- **THEN** su celda Proveedor contiene Planilla

#### Scenario: Conservar fechas y porcentaje

- **WHEN** una asignación se exporta
- **THEN** Fecha Inicio y Fecha Fin representan las fechas almacenadas
- **AND** % asignado representa el valor de allocation_percentage de la asignación

### Requirement: Comunicar el resultado de la descarga

El control de exportación SHALL tener un nombre accesible, SHALL indicar visualmente que la descarga está en curso y SHALL impedir activaciones duplicadas mientras la solicitud esté pendiente. Si la solicitud falla, el sistema SHALL mostrar un mensaje de error comprensible y SHALL mantener intactos los filtros y resultados visibles.

#### Scenario: Descarga en curso

- **WHEN** la persona activa Descargar Excel
- **THEN** el control se deshabilita y comunica que la descarga está en curso hasta completar o fallar la solicitud

#### Scenario: Error de exportación

- **WHEN** la API no puede generar o entregar el archivo
- **THEN** el módulo muestra un mensaje de error y conserva el listado y los filtros actuales

#### Scenario: Sin resultados coincidentes

- **WHEN** se solicita una exportación cuyos filtros no coinciden con ninguna asignación
- **THEN** el sistema descarga un archivo válido que contiene los encabezados y ninguna fila de datos
