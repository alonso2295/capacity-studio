## Purpose

Esta capacidad ofrece una lectura trimestral de la capacidad y composición del equipo para detectar ocupación, disponibilidad y distribución de roles.

## ADDED Requirements

### Requirement: El sistema permite seleccionar el trimestre de análisis

El sistema SHALL permitir seleccionar un año y un trimestre del calendario (`Q1`, `Q2`, `Q3` o `Q4`). Al abrir el módulo SHALL seleccionar por defecto el trimestre calendario actual. El rango del trimestre SHALL ser inclusivo y una asignación SHALL pertenecer al trimestre cuando `assignment.end_date >= quarter_start` y `assignment.start_date <= quarter_end`.

#### Scenario: Selección de trimestre

- **WHEN** el usuario selecciona un año y un trimestre
- **THEN** el sistema actualiza las métricas dependientes usando exclusivamente asignaciones que intersectan el rango inclusivo seleccionado

#### Scenario: Límites inclusivos

- **WHEN** una asignación comienza el primer día del trimestre o termina el último día del trimestre
- **THEN** el sistema la considera dentro del trimestre seleccionado

### Requirement: El sistema muestra KPIs trimestrales

Para el trimestre seleccionado, el sistema SHALL mostrar como mínimo:

- Total de Squads activos con al menos una asignación no marcada como renuncia en el trimestre, agrupados por `Squad Ejecutor`.
- Total de miembros activos asignados, contando cada miembro una sola vez.
- Cantidad de miembros activos sin asignación no marcada como renuncia durante el trimestre.
- Cantidad de miembros únicos con una asignación marcada como `Miembro renunció` que intersecta el trimestre.

Las asignaciones con `member_resigned = true` SHALL excluirse de las métricas operativas de Squads, roles, proveedores y miembros asignados, pero SHALL incluirse en la métrica independiente de renuncias.

#### Scenario: KPIs con asignaciones operativas y renuncias

- **WHEN** el trimestre tiene miembros con asignaciones normales y otros con asignaciones marcadas como renuncia
- **THEN** los KPIs operativos cuentan únicamente las asignaciones normales y el KPI de renuncias cuenta los miembros marcados por separado

#### Scenario: Sin datos trimestrales

- **WHEN** no existen asignaciones que intersecten el trimestre seleccionado
- **THEN** el sistema muestra ceros, estados vacíos explicativos y no presenta un error técnico

### Requirement: El sistema muestra la distribución de roles por Squad Ejecutor

El sistema SHALL mostrar la distribución de miembros únicos por rol profesional para cada `Squad Ejecutor` con asignaciones operativas en el trimestre seleccionado. Una persona SHALL contarse una sola vez dentro de cada combinación de Squad Ejecutor y rol, aunque tenga varias asignaciones superpuestas para ese Squad. La visualización SHALL identificar el Squad Ejecutor, el rol y la cantidad.

#### Scenario: Distribución por Squad Ejecutor

- **WHEN** existen miembros con asignaciones no marcadas como renuncia en distintos Squads Ejecutores
- **THEN** el sistema muestra la cantidad de miembros por rol dentro de cada Squad Ejecutor y excluye las asignaciones marcadas como renuncia

#### Scenario: Miembro con varias asignaciones

- **WHEN** un miembro tiene varias asignaciones operativas del mismo rol en el mismo Squad Ejecutor durante el trimestre
- **THEN** el sistema lo cuenta una sola vez para esa combinación

### Requirement: El sistema permite consultar miembros activos sin asignación

El sistema SHALL ofrecer una acción de detalle sobre el KPI de miembros activos sin asignación. La acción SHALL abrir una ventana accesible con el nombre completo y DNI de cada miembro que esté activo y no tenga ninguna asignación operativa que intersecte el trimestre seleccionado.

#### Scenario: Abrir detalle de miembros sin asignación

- **WHEN** el usuario selecciona el detalle del KPI de miembros sin asignación
- **THEN** el sistema abre una ventana con el nombre completo y DNI de cada miembro incluido en el conteo

#### Scenario: El miembro solo tiene una asignación marcada como renuncia

- **WHEN** un miembro activo solo tiene asignaciones marcadas como renuncia que intersectan el trimestre
- **THEN** el sistema lo considera sin asignación operativa y lo incluye en el detalle

#### Scenario: No existen miembros sin asignación

- **WHEN** todos los miembros activos tienen al menos una asignación operativa en el trimestre
- **THEN** el detalle muestra un estado vacío y el conteo permanece en cero

### Requirement: El sistema muestra miembros por proveedor y rol

Para el trimestre seleccionado, el sistema SHALL mostrar la cantidad de miembros únicos por proveedor capturado en la asignación y rol profesional. Los miembros de planilla SHALL agruparse bajo una categoría equivalente a `Planilla`. Las asignaciones marcadas como renuncia SHALL excluirse. Si un miembro tiene snapshots de proveedor diferentes en asignaciones operativas del mismo trimestre, SHALL aparecer en cada combinación de proveedor y rol que corresponda a esas asignaciones.

#### Scenario: Distribución por proveedor y rol

- **WHEN** existen miembros tercerizados y de planilla con asignaciones operativas
- **THEN** el sistema muestra las cantidades separadas por proveedor o `Planilla` y por rol profesional

#### Scenario: Proveedor histórico capturado

- **WHEN** el proveedor actual del miembro difiere del proveedor guardado en una asignación del trimestre
- **THEN** el sistema usa el proveedor capturado en la asignación para la métrica

### Requirement: El módulo es visible para cualquier usuario de la aplicación

El módulo y su consulta de métricas SHALL estar disponibles para cualquier usuario autenticado de la aplicación, sin exigir el rol `Chapter Lead`. El sistema SHALL mantener las protecciones generales de autenticación de la aplicación y no SHALL exponer credenciales de Supabase al navegador.

#### Scenario: Usuario sin rol administrativo

- **WHEN** un usuario autenticado que no es Chapter Lead abre el módulo
- **THEN** puede consultar los filtros y visualizar las métricas sin recibir un rechazo por rol administrativo

### Requirement: El usuario puede volver a la gestión central

El módulo SHALL ofrecer un botón o enlace visible y accesible que permita volver a la página central de gestión de la aplicación.

#### Scenario: Regreso a la página central

- **WHEN** el usuario selecciona la acción de volver a la gestión central
- **THEN** el sistema navega a la página central de la aplicación sin modificar las métricas almacenadas

### Requirement: El sistema presenta visualizaciones accesibles y estados de consulta

El módulo SHALL mostrar estados de carga, error y ausencia de datos para cada consulta. Las visualizaciones SHALL incluir títulos o textos accesibles, ser utilizables en viewport móvil y ofrecer los valores numéricos además de las representaciones gráficas. La ventana de detalle SHALL permitir cierre por botón identificable y teclado.

#### Scenario: Carga y error

- **WHEN** la consulta de métricas está cargando o falla
- **THEN** el sistema muestra un estado identificable de carga o error sin presentar datos parciales como definitivos

#### Scenario: Visualización responsive

- **WHEN** el usuario consulta el módulo en una pantalla móvil
- **THEN** las tarjetas, distribuciones y ventana de detalle permanecen legibles sin overflow horizontal de la página
