# metrics-assignment-cards Specification

## Purpose
Esta capacidad permite explorar las asignaciones de un trimestre mediante cards
compactas y filtros operativos, mostrando la relación entre Squad Asignado y
Squad Ejecutor sin exponer información innecesaria en cada card.

## Requirements

### Requirement: Filtros de asignaciones métricas

El sistema SHALL permitir seleccionar año y trimestre, proveedor, rol profesional
y uno o más Squads Asignados para la sección de asignaciones del módulo de
métricas. El filtro de Squad Asignado SHALL ser multiseleccionable; sin Squads
seleccionados SHALL significar todos los Squads. Los filtros de proveedor, rol y
Squad SHALL combinarse con lógica AND y SHALL aplicarse sobre asignaciones que
intersecten inclusivamente el trimestre seleccionado.

#### Scenario: Selección de periodo

- **WHEN** el usuario cambia el año o trimestre
- **THEN** el sistema vuelve a consultar el dashboard y actualiza las cards con las asignaciones que intersectan el nuevo trimestre

#### Scenario: Selección de múltiples Squads

- **WHEN** el usuario selecciona dos o más Squads Asignados
- **THEN** el sistema muestra las asignaciones cuyo Squad Asignado pertenece a cualquiera de los Squads seleccionados y conserva los filtros de proveedor y rol

#### Scenario: Combinación de filtros

- **WHEN** el usuario selecciona un proveedor, un rol y uno o más Squads Asignados
- **THEN** solo se muestran cards que cumplen simultáneamente todos los criterios

#### Scenario: Limpieza del selector de Squads

- **WHEN** el usuario desmarca todos los Squads seleccionados
- **THEN** el sistema muestra asignaciones de todos los Squads Asignados para los demás filtros activos

### Requirement: Consulta accesible de opciones y asignaciones

El endpoint de métricas SHALL aceptar el año, trimestre, proveedor, rol y una
lista de Squads Asignados, y SHALL devolver las asignaciones filtradas junto con
las opciones activas necesarias para construir los filtros. Las opciones de
proveedor, rol y Squad SHALL estar disponibles para cualquier usuario que pueda
consultar métricas, sin depender del permiso específico de administración de
catálogos.

#### Scenario: Carga del módulo por usuario autorizado

- **WHEN** un usuario autenticado consulta el módulo de métricas
- **THEN** el sistema devuelve las opciones de filtros y las asignaciones sin exigir el rol Chapter Lead

#### Scenario: Consulta sin filtros operativos

- **WHEN** el usuario consulta un año y trimestre sin proveedor, rol ni Squad seleccionado
- **THEN** el sistema devuelve todas las asignaciones operativas que intersectan el trimestre

#### Scenario: Parámetros de periodo inválidos

- **WHEN** se solicita un año fuera del rango permitido o un trimestre distinto de 1 a 4
- **THEN** el endpoint rechaza la solicitud con un error de validación y no devuelve cards parciales

### Requirement: Cards de asignaciones

El sistema SHALL mostrar las asignaciones filtradas en una vista de cards. Cada
card SHALL mostrar únicamente: nombre completo, rol profesional, proveedor,
proyecto, capacidad asignada y Squad Ejecutor. La card SHALL mostrar `Planilla`
cuando la asignación no tenga proveedor. Los datos del Squad Asignado SHALL
usarse para agrupar o filtrar, pero no SHALL mostrarse como un campo adicional
dentro de la card. Las cards SHALL utilizar un diseño compacto y minimalista,
con jerarquía visual clara, espaciado reducido y sin áreas vacías
desproporcionadas, manteniendo la legibilidad de los seis campos.

Las asignaciones marcadas como miembro renunció SHALL excluirse de esta vista
operativa, manteniendo la consistencia con las agrupaciones actuales del
dashboard.

#### Scenario: Render de una card

- **WHEN** existe una asignación operativa que cumple los filtros
- **THEN** la card muestra nombre completo, rol, proveedor, proyecto, capacidad y Squad Ejecutor

#### Scenario: Proveedor de planilla

- **WHEN** una asignación no tiene proveedor
- **THEN** la card muestra `Planilla` en el campo proveedor

#### Scenario: Exclusión de renuncias

- **WHEN** una asignación intersecta el trimestre pero está marcada como miembro renunció
- **THEN** no se muestra como card operativa ni se incluye en el listado de grupos

### Requirement: Perspectivas de Squad

El sistema SHALL permitir alternar entre las perspectivas `Squad Asignado` y
`Squad Ejecutor`. La perspectiva seleccionada SHALL cambiar los grupos visuales
y SHALL mantener las mismas cards filtradas. El filtro de Squad Asignado SHALL
seguir aplicándose en ambas perspectivas; la perspectiva de Squad Ejecutor no
deberá cambiar silenciosamente los filtros seleccionados.

#### Scenario: Perspectiva de Squad Asignado

- **WHEN** el usuario selecciona la perspectiva Squad Asignado
- **THEN** las cards se agrupan bajo el nombre del Squad Asignado correspondiente

#### Scenario: Perspectiva de Squad Ejecutor

- **WHEN** el usuario selecciona la perspectiva Squad Ejecutor
- **THEN** las mismas asignaciones se reagrupan bajo el nombre del Squad Ejecutor y cada card conserva el campo Squad Ejecutor

#### Scenario: Cambio de perspectiva con filtros activos

- **WHEN** el usuario cambia de perspectiva después de aplicar proveedor, rol o múltiples Squads Asignados
- **THEN** los filtros permanecen activos y solo cambia la agrupación visual

### Requirement: Estados, accesibilidad y responsive

El sistema SHALL mostrar estados de carga, error y vacío para la sección de
cards. El selector multiselección SHALL ser operable por teclado, anunciar sus
opciones seleccionadas y tener un nombre accesible. Las pestañas o botones de
perspectiva SHALL exponer su estado seleccionado. En pantallas pequeñas las
cards SHALL adaptarse sin producir overflow horizontal de la página.

#### Scenario: Sin asignaciones para los filtros

- **WHEN** ningún registro cumple el periodo y los filtros seleccionados
- **THEN** el sistema muestra un mensaje de estado vacío y conserva disponibles los controles para modificar los filtros

#### Scenario: Uso accesible del selector multiselección

- **WHEN** el usuario navega el selector de Squad Asignado con teclado
- **THEN** puede abrirlo, marcar o desmarcar opciones y percibe cuántos Squads están seleccionados

#### Scenario: Vista móvil

- **WHEN** el usuario consulta las cards en una pantalla móvil
- **THEN** el contenido se reorganiza en una columna, mantiene legibles los seis campos y no amplía horizontalmente el documento
