# assignment-list-controls Specification

## Purpose
Esta capacidad permite recorrer, ordenar y consultar de forma predecible un listado de asignaciones que puede crecer sin degradar la experiencia de la vista tabla.

## Requirements

### Requirement: El listado de asignaciones debe estar paginado en la vista tabla

La vista tabla SHALL mostrar las asignaciones en páginas y SHALL ofrecer controles para avanzar, retroceder y seleccionar el tamaño de página. La respuesta del listado SHALL incluir los registros de la página actual y metadatos de total, página actual, tamaño de página y cantidad total de páginas. La paginación SHALL ser estable y no SHALL duplicar ni omitir registros cuando los criterios permanezcan iguales.

#### Scenario: Navegación entre páginas

- **WHEN** existen más asignaciones que el tamaño de página seleccionado y el usuario avanza a la siguiente página
- **THEN** la tabla muestra el siguiente conjunto de registros y conserva los filtros y el ordenamiento activo

#### Scenario: Primera y última página

- **WHEN** el usuario está en la primera o última página
- **THEN** el control correspondiente para retroceder o avanzar permanece deshabilitado y la tabla no solicita una página fuera del rango válido

#### Scenario: Cambio de tamaño de página

- **WHEN** el usuario cambia el tamaño de página
- **THEN** el sistema actualiza la tabla desde la primera página usando el nuevo tamaño y recalcula la cantidad de páginas

### Requirement: Las columnas de la vista tabla deben permitir ordenar

Cada columna de datos visible en la vista tabla SHALL ofrecer una acción de ordenamiento. El primer clic SHALL ordenar ascendentemente por esa columna y el siguiente clic sobre la misma columna SHALL invertir la dirección. La tabla SHALL indicar visualmente y con texto accesible la columna y dirección activas. El ordenamiento SHALL aplicarse antes de paginar.

#### Scenario: Orden ascendente y descendente

- **WHEN** el usuario selecciona una columna y luego vuelve a seleccionarla
- **THEN** la primera interacción solicita orden ascendente y la segunda solicita orden descendente para la misma columna

#### Scenario: Ordenamiento entre páginas

- **WHEN** el usuario cambia la columna o dirección de ordenamiento
- **THEN** el sistema vuelve a la primera página y presenta los registros según el nuevo orden global

#### Scenario: Orden estable

- **WHEN** dos o más asignaciones tienen el mismo valor en la columna ordenada
- **THEN** el sistema aplica un desempate determinista para conservar el orden entre solicitudes y páginas

### Requirement: Los filtros de fechas deben ser opcionales e inclusivos

Al abrir el módulo de asignaciones, los campos `Fecha inicio` y `Fecha fin` SHALL estar vacíos y la consulta inicial SHALL omitir los filtros de fecha. Cuando el usuario ingrese fechas, la consulta SHALL filtrar por intersección inclusiva: `assignment.end_date >= start_date` y `assignment.start_date <= end_date`.

#### Scenario: Apertura del módulo sin fechas

- **WHEN** el usuario abre el módulo
- **THEN** `Fecha inicio` y `Fecha fin` están vacíos y el listado inicial no restringe las asignaciones por fecha

#### Scenario: Asignación en un límite del periodo consultado

- **WHEN** el usuario ingresa un periodo y una asignación comienza en su primer día o termina en su último día
- **THEN** la asignación aparece en el listado inicial

#### Scenario: Limpiar filtros

- **WHEN** el usuario selecciona `Limpiar filtros`
- **THEN** los criterios se restablecen, las fechas quedan vacías y la tabla vuelve a la primera página

### Requirement: Los filtros y el modo cards deben mantener un comportamiento consistente

Al cambiar cualquier filtro, el sistema SHALL reiniciar la vista tabla en la primera página y SHALL conservar el filtro, ordenamiento y tamaño de página al navegar dentro de sus resultados. La vista cards SHALL conservar sus filtros actuales y no SHALL mostrar controles de paginación propios de la vista tabla.

#### Scenario: Cambio de filtro con página avanzada

- **WHEN** el usuario está en una página posterior y cambia proveedor, rol, Squad, búsqueda, fechas o estado de renuncia
- **THEN** el sistema consulta la primera página con los nuevos criterios y conserva el ordenamiento seleccionado

#### Scenario: Cambio entre tabla y cards

- **WHEN** el usuario cambia de tabla a cards o viceversa
- **THEN** los filtros permanecen aplicados y la vista tabla recupera sus controles de página sin alterar los criterios

### Requirement: La API debe validar y describir la consulta paginada

El endpoint de asignaciones SHALL aceptar parámetros de página, tamaño de página, columna de ordenamiento y dirección, además de los filtros existentes. SHALL rechazar páginas menores que uno, tamaños fuera del límite permitido, columnas no soportadas o direcciones distintas de `asc` y `desc` con un error de validación. La respuesta SHALL conservar la autorización existente del módulo.

#### Scenario: Parámetros válidos

- **WHEN** la API recibe filtros, `page`, `page_size`, `sort_by` y `sort_direction` válidos
- **THEN** responde únicamente la página solicitada, sus metadatos y los registros ordenados globalmente

#### Scenario: Parámetros inválidos

- **WHEN** la API recibe un tamaño, columna o dirección no permitidos
- **THEN** responde un error de validación sin ejecutar una consulta ambigua

#### Scenario: Sin resultados

- **WHEN** los filtros no coinciden con ninguna asignación
- **THEN** responde una página vacía con total cero y metadatos válidos, sin error técnico
