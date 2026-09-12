## Purpose

Definir una vista de cards de asignaciones más resumida, legible y accesible para identificar rápidamente a cada miembro, su proveedor, proyecto, Squad Ejecutor y capacidad asignada.

## ADDED Requirements

### Requirement: Mostrar únicamente la información operativa esencial

La card de cada asignación DEBE (MUST) mostrar solamente el nombre completo del miembro, su rol, la empresa proveedora, el código de proyecto, el Squad Ejecutor y la capacidad asignada.

#### Scenario: La asignación tiene proveedor

- **GIVEN** una asignación con nombre completo, rol, proveedor, proyecto, Squad Ejecutor y porcentaje de asignación
- **WHEN** se muestra la vista de cards
- **THEN** la card muestra el nombre completo, el rol, el nombre del proveedor, el código de proyecto, el nombre del Squad Ejecutor y el porcentaje seguido de `%`

#### Scenario: La asignación no tiene proveedor

- **GIVEN** una asignación cuyo proveedor es nulo
- **WHEN** se muestra la vista de cards
- **THEN** la card muestra `Planilla` como empresa proveedora

#### Scenario: La card no muestra datos secundarios

- **GIVEN** una asignación con DNI, seniority, fechas, estado de renuncia, Squad Asignado y Squad Ejecutor
- **WHEN** se muestra la vista de cards
- **THEN** la card no muestra DNI, seniority, fecha de inicio, fecha de fin, indicador de renuncia ni el nombre de Squad Asignado dentro de su contenido

### Requirement: Presentar una jerarquía visual clara y responsive

La vista DEBE (MUST) dar mayor jerarquía al nombre completo, agrupar rol y proveedor como metadatos, separar visualmente el proyecto y el Squad Ejecutor, y destacar la capacidad asignada sin depender únicamente del color.

#### Scenario: Visualización en escritorio

- **GIVEN** una lista de asignaciones agrupada por squad
- **WHEN** el usuario abre la vista de cards en un viewport de escritorio
- **THEN** las cards se presentan con espaciado consistente, borde y sombra sutil, y la capacidad asignada es identificable de forma inmediata

#### Scenario: Visualización en móvil

- **GIVEN** una lista de asignaciones agrupada por squad
- **WHEN** el usuario abre la vista de cards en un viewport móvil
- **THEN** las cards se apilan en una columna, el contenido puede leerse sin desplazamiento horizontal y los nombres o códigos largos pueden ajustarse sin romper el layout

### Requirement: Proporcionar acciones de card mediante controles de icono accesibles

Las cards DEBEN (MUST) ofrecer editar y eliminar mediante controles de icono que tengan nombre accesible, tooltip, estado de foco visible y un área táctil suficiente.

#### Scenario: Editar una asignación desde una card

- **GIVEN** una card visible
- **WHEN** el usuario activa el control de editar
- **THEN** se abre el mismo flujo de edición para la asignación seleccionada
- **AND** el control expone un nombre accesible equivalente a `Editar asignación`

#### Scenario: Solicitar confirmación antes de eliminar

- **GIVEN** una card visible
- **WHEN** el usuario activa el control de eliminar
- **THEN** se solicita confirmación antes de ejecutar la eliminación o desactivación
- **AND** el control expone un nombre accesible equivalente a `Eliminar asignación`

#### Scenario: Navegar acciones con teclado

- **GIVEN** el usuario navega la vista usando teclado
- **WHEN** el foco llega a los controles de editar o eliminar
- **THEN** cada control recibe un indicador de foco visible y puede activarse sin usar el mouse

### Requirement: Conservar el contexto de agrupación y el comportamiento existente

La vista DEBE (MUST) conservar las pestañas de perspectiva Squad Asignado y Squad Ejecutor, la agrupación por la perspectiva activa, los filtros existentes y la operación correcta sobre la asignación seleccionada.

#### Scenario: Cambiar la perspectiva de cards

- **GIVEN** la vista de cards con asignaciones en ambas perspectivas
- **WHEN** el usuario cambia entre Squad Asignado y Squad Ejecutor
- **THEN** se actualizan los grupos y sus encabezados según la perspectiva seleccionada
- **AND** cada card mantiene únicamente los seis datos definidos para su contenido, incluido el Squad Ejecutor

#### Scenario: Aplicar filtros existentes

- **GIVEN** filtros activos en el listado de asignaciones
- **WHEN** el usuario cambia a la vista de cards o modifica un filtro
- **THEN** las cards representan solamente las asignaciones filtradas sin alterar las reglas de filtrado actuales
