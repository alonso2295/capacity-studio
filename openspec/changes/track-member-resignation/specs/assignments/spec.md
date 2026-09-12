## ADDED Requirements

### Requirement: El sistema permite marcar la renuncia en una asignación

El sistema SHALL permitir que un usuario autorizado indique si el miembro renunció en una asignación mediante el campo `member_resigned`. El valor SHALL pertenecer a la asignación y no al miembro; SHALL ser `false` por defecto en nuevas asignaciones y en registros existentes migrados. El usuario SHALL poder activar o desactivar la marca al crear o editar una asignación. Activar la marca SHALL NOT cambiar automáticamente la fecha fin, el estado del miembro, el proveedor capturado, los Squads ni cualquier otro dato.

#### Scenario: Nueva asignación sin marca de renuncia

- **WHEN** un Chapter Lead crea una asignación válida y no indica que el miembro renunció
- **THEN** el sistema guarda `member_resigned` como `false`

#### Scenario: Marcar una asignación por renuncia

- **WHEN** un Chapter Lead activa `Miembro renunció` en una asignación
- **THEN** el sistema guarda la asignación con `member_resigned` igual a `true` y conserva el resto de sus datos sin cambios

#### Scenario: Desmarcar una asignación

- **WHEN** un Chapter Lead desactiva `Miembro renunció` en una asignación marcada
- **THEN** el sistema guarda `member_resigned` como `false` sin modificar la fecha fin ni los demás datos

### Requirement: El sistema conserva la fecha final y permite registrar un reemplazo independiente

El sistema SHALL permitir editar la fecha fin de una asignación marcada para establecer el último día laboral del miembro, respetando la validación de que no sea anterior a la fecha de inicio. Marcar la renuncia SHALL NOT actualizar automáticamente esa fecha. La asignación marcada SHALL continuar consumiendo su porcentaje de capacidad hasta su fecha fin inclusive. Una persona contratada como reemplazo SHALL registrarse mediante una nueva asignación independiente, sin requerir un vínculo con la asignación marcada y sin modificarla.

#### Scenario: Ajustar el último día laboral

- **WHEN** un Chapter Lead marca una asignación como renuncia y actualiza su fecha fin al último día laboral
- **THEN** el sistema guarda ambas modificaciones y la asignación deja de consumir capacidad a partir del día siguiente a la nueva fecha fin

#### Scenario: Renuncia sin actualización automática de fecha

- **WHEN** un Chapter Lead activa la marca de renuncia sin cambiar la fecha fin
- **THEN** el sistema conserva la fecha fin existente y mantiene la asignación vigente hasta esa fecha inclusive

#### Scenario: Registrar el reemplazo

- **WHEN** un Chapter Lead crea una asignación para otra persona durante el tiempo restante del servicio
- **THEN** el sistema crea una nueva asignación independiente y conserva la asignación marcada con su miembro, proveedor, fechas y porcentaje propios

### Requirement: El sistema permite consultar y visualizar las asignaciones marcadas

El listado SHALL aceptar un filtro opcional de renuncia con tres estados: todas, `Miembro renunció` y `Miembro activo en la asignación`. Al seleccionar un estado, el sistema SHALL mostrar únicamente asignaciones cuyo `member_resigned` coincida con el valor solicitado. La tabla y la vista de cards SHALL mostrar una etiqueta visual cuando `member_resigned` sea `true`; las cards SHALL mantener las restricciones visuales existentes y no SHALL mostrar los nombres de Squad dentro del contenido de cada card.

#### Scenario: Filtrar asignaciones con renuncia

- **WHEN** el usuario selecciona el filtro `Miembro renunció`
- **THEN** el listado muestra únicamente asignaciones con `member_resigned` igual a `true`

#### Scenario: Filtrar asignaciones sin renuncia

- **WHEN** el usuario selecciona el filtro `Miembro activo en la asignación`
- **THEN** el listado muestra únicamente asignaciones con `member_resigned` igual a `false`

#### Scenario: Mostrar la etiqueta en tabla y cards

- **WHEN** una asignación marcada aparece en cualquiera de las vistas
- **THEN** el sistema muestra una etiqueta legible `Miembro renunció` asociada a esa asignación

#### Scenario: Filtro combinado

- **WHEN** el usuario combina el filtro de renuncia con búsqueda, proveedor, rol, Squad Asignado o fechas
- **THEN** el sistema muestra únicamente las asignaciones que cumplen todos los criterios activos y conserva los filtros al cambiar entre tabla y cards

### Requirement: El sistema protege la marca según los permisos existentes

Las operaciones de consulta, creación y edición del campo `member_resigned` SHALL conservar la autorización existente de asignaciones: solo un usuario con rol `Chapter Lead` podrá ejecutarlas. Los clientes que no envíen el campo al actualizar una asignación SHALL conservar su valor actual.

#### Scenario: Usuario sin permisos

- **WHEN** un usuario sin rol `Chapter Lead` intenta consultar o cambiar la marca
- **THEN** la API rechaza la operación con el estado de autorización correspondiente y no modifica la asignación

#### Scenario: Actualización parcial compatible

- **WHEN** una edición actualiza fechas, porcentaje o proyecto sin incluir `member_resigned`
- **THEN** el sistema conserva el valor existente de la marca
