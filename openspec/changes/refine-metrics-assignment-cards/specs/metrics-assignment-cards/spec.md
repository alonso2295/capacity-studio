## MODIFIED Requirements

### Requirement: Cards de asignaciones

El sistema SHALL mostrar las asignaciones filtradas en una vista de cards. Cada
card SHALL mostrar únicamente: nombre completo, rol profesional, proveedor,
proyecto, capacidad asignada y Squad Ejecutor. La card SHALL mostrar `Planilla`
cuando la asignación no tenga proveedor. Los datos del Squad Asignado SHALL
usarse para agrupar o filtrar, pero no SHALL mostrarse como un campo adicional
dentro de la card. Las cards SHALL utilizar un diseño compacto y minimalista,
con jerarquía visual clara, espaciado reducido y sin áreas vacías
desproporcionadas, manteniendo la legibilidad de los seis campos.

Los valores de rol profesional, proveedor y proyecto SHALL permanecer visibles,
pero sus rótulos `Rol`, `Proveedor` y `Proyecto` SHALL NOT mostrarse como texto
visible dentro de la card. La ausencia de esos rótulos visibles SHALL NOT
ocultar, reemplazar ni alterar sus valores. Las asignaciones marcadas como
miembro renunció SHALL excluirse de esta vista operativa, manteniendo la
consistencia con las agrupaciones actuales del dashboard.

#### Scenario: Render de una card

- **WHEN** existe una asignación operativa que cumple los filtros
- **THEN** la card muestra el nombre completo, el valor del rol, el valor del proveedor, el valor del proyecto, la capacidad y el Squad Ejecutor
- **AND** la card no muestra visualmente los textos `Rol`, `Proveedor` ni `Proyecto` como títulos de campo

#### Scenario: Proveedor de planilla

- **WHEN** una asignación no tiene proveedor
- **THEN** la card muestra `Planilla` como valor del proveedor sin mostrar el rótulo `Proveedor`

#### Scenario: Exclusión de renuncias

- **WHEN** una asignación intersecta el trimestre pero está marcada como miembro renunció
- **THEN** no se muestra como card operativa ni se incluye en el listado de grupos

### Requirement: Perspectivas de Squad

El sistema SHALL permitir alternar entre las perspectivas `Squad Asignado` y
`Squad Ejecutor`. La perspectiva seleccionada SHALL cambiar los grupos visuales
y SHALL mantener las mismas cards filtradas. El filtro de Squad Asignado SHALL
seguir aplicándose en ambas perspectivas; la perspectiva de Squad Ejecutor no
deberá cambiar silenciosamente los filtros seleccionados. El orden de las cards
definido para cada grupo SHALL conservarse al cambiar de perspectiva.

#### Scenario: Perspectiva de Squad Asignado

- **WHEN** el usuario selecciona la perspectiva Squad Asignado
- **THEN** las cards se agrupan bajo el nombre del Squad Asignado correspondiente

#### Scenario: Perspectiva de Squad Ejecutor

- **WHEN** el usuario selecciona la perspectiva Squad Ejecutor
- **THEN** las mismas asignaciones se reagrupan bajo el nombre del Squad Ejecutor y cada card conserva el campo Squad Ejecutor

#### Scenario: Cambio de perspectiva con filtros activos

- **WHEN** el usuario cambia de perspectiva después de aplicar proveedor, rol o múltiples Squads Asignados
- **THEN** los filtros permanecen activos y solo cambia la agrupación visual y la posición de las cards dentro de cada grupo según el orden definido

## ADDED Requirements

### Requirement: Orden de miembros dentro de los grupos

El sistema SHALL ordenar las cards dentro de cada grupo visual primero por el
nombre del rol profesional en orden ascendente y luego por el nombre del
proveedor en orden ascendente. Para el orden del proveedor SHALL usarse el valor
visible en la card, incluyendo `Planilla` cuando no exista proveedor. Cuando
ambos valores coincidan, SHALL usar el nombre completo del miembro y luego el
identificador de la asignación como desempates estables.

#### Scenario: Arquitectos antes que ingenieros

- **WHEN** un mismo grupo contiene miembros con los roles `Data Architect` y `Data Engineer`
- **THEN** todas las cards de `Data Architect` aparecen antes que las cards de `Data Engineer`

#### Scenario: Proveedores ordenados dentro del rol

- **WHEN** un mismo grupo contiene varias cards con el mismo rol y proveedores distintos
- **THEN** las cards de ese rol aparecen en orden ascendente por nombre de proveedor

#### Scenario: Orden independiente de la perspectiva

- **WHEN** el usuario cambia entre Squad Asignado y Squad Ejecutor
- **THEN** cada grupo resultante muestra sus cards aplicando el mismo orden por rol, proveedor y desempates estables

#### Scenario: Filtros no alteran el criterio

- **WHEN** el usuario aplica filtros de proveedor, rol o Squad Asignado
- **THEN** las cards restantes conservan el orden por rol y proveedor dentro de cada grupo
