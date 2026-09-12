## Purpose

Definir una presentación compacta y accesible de la tabla de asignaciones, con acciones de icono y una identificación visual clara de los miembros que renunciaron sin agregar una columna adicional.

## ADDED Requirements

### Requirement: La tabla debe ofrecer acciones de icono accesibles

La tabla MUST mostrar las acciones de editar y eliminar como botones de icono, sin etiquetas textuales visibles junto al icono. Cada botón MUST tener un nombre accesible, tooltip, foco visible y poder activarse con teclado.

#### Scenario: Acciones disponibles en una fila

- **GIVEN** una asignación visible en la tabla
- **WHEN** el usuario revisa la columna de acciones
- **THEN** encuentra un control de icono para editar y otro para eliminar
- **AND** cada control expone un nombre accesible equivalente a `Editar asignación` o `Eliminar asignación`

#### Scenario: Editar desde la tabla

- **GIVEN** una fila de asignación visible
- **WHEN** el usuario activa el icono `Editar asignación`
- **THEN** se abre el mismo flujo de edición para la asignación de esa fila

#### Scenario: Eliminar desde la tabla

- **GIVEN** una fila de asignación visible
- **WHEN** el usuario activa el icono `Eliminar asignación`
- **THEN** se solicita confirmación antes de eliminar o desactivar la asignación

### Requirement: La tabla no debe mostrar una columna independiente de renuncia

La tabla MUST omitir la columna visible `Renuncia` y no MUST ofrecer esa columna como opción de ordenamiento. El filtro de renuncia y el estado dentro del flujo de edición MUST conservarse.

#### Scenario: Encabezados sin columna de renuncia

- **GIVEN** la tabla de asignaciones con registros
- **WHEN** se renderizan sus encabezados
- **THEN** no aparece un encabezado `Renuncia` ni un control para ordenar por esa columna

### Requirement: Identificar visualmente a los miembros que renunciaron

Cuando una asignación tenga el estado de renuncia activo, el nombre del team member MUST mostrarse en color magenta. El estado MUST incluir además una marca accesible equivalente a `Miembro renunció`, de manera que su identificación no dependa únicamente del color.

#### Scenario: Miembro con renuncia

- **GIVEN** una asignación con `member_resigned` activo
- **WHEN** se muestra su fila en la tabla
- **THEN** el nombre del team member aparece en magenta
- **AND** una tecnología de asistencia puede identificar que `Miembro renunció`

#### Scenario: Miembro sin renuncia

- **GIVEN** una asignación con `member_resigned` inactivo
- **WHEN** se muestra su fila en la tabla
- **THEN** el nombre conserva el estilo normal y no anuncia el estado de renuncia

### Requirement: Conservar el comportamiento del listado

La modificación visual MUST conservar los filtros, paginación, ordenamiento de las demás columnas, edición, eliminación y confirmaciones existentes.

#### Scenario: Filtrar por renuncia

- **GIVEN** el usuario selecciona un valor en el filtro de renuncia
- **WHEN** el listado se actualiza
- **THEN** se muestran las asignaciones que cumplen el filtro y sus nombres respetan la presentación visual correspondiente

#### Scenario: Ordenar una columna existente

- **GIVEN** el usuario selecciona una columna distinta de `Renuncia`
- **WHEN** cambia la dirección de ordenamiento
- **THEN** la tabla conserva el comportamiento de ordenamiento y paginación actual
