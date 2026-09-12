# squads Specification

## Purpose
Permitir que los Chapter Leads mantengan un catálogo confiable de Squads para su consulta y uso posterior en los procesos de asignación de capacidad.

## Requirements

### Requirement: El Chapter Lead puede administrar Squads

El sistema SHALL permitir registrar, consultar, editar, desactivar y reactivar Squads únicamente a usuarios autenticados con rol `Chapter Lead`. La administración del Squad SHALL ser independiente de la autenticación y de la creación de cuentas de usuarios.

#### Scenario: Chapter Lead accede al módulo

- **WHEN** un usuario autenticado con rol `Chapter Lead` navega al módulo de Squads
- **THEN** el sistema muestra el listado y permite iniciar las operaciones disponibles según el estado de cada Squad

#### Scenario: Usuario sin permiso intenta administrar Squads

- **WHEN** un usuario con rol `Focal Proveedor` o `Miembro de Equipo` intenta consultar o modificar el catálogo de Squads
- **THEN** el sistema rechaza la operación y no expone ni modifica datos de Squads

### Requirement: El formulario captura los datos del Squad

El sistema SHALL permitir registrar y editar únicamente los siguientes datos de negocio: `Código del squad`, `Nombre de Squad`, `Tribu` y `Nombre del PO del Squad`. El código y el nombre SHALL ser obligatorios. Tribu y nombre del PO SHALL ser opcionales.

#### Scenario: Se visualizan los campos del Squad

- **WHEN** el Chapter Lead abre el formulario de alta o edición
- **THEN** el sistema muestra los cuatro campos con etiquetas visibles e indica como obligatorios únicamente código y nombre

#### Scenario: Se registra un Squad con datos válidos

- **WHEN** el Chapter Lead completa un código alfanumérico y un nombre válidos, dejando vacíos o completando los campos opcionales
- **THEN** el sistema crea un Squad activo y muestra una confirmación de registro exitoso

#### Scenario: Faltan campos obligatorios

- **WHEN** el Chapter Lead envía el formulario sin código o sin nombre
- **THEN** el sistema rechaza el envío y muestra un error específico junto al campo faltante sin crear el Squad

### Requirement: El código del Squad es alfanumérico y único

El sistema SHALL aceptar en el código únicamente letras y números, conservarlo como texto, eliminar espacios sobrantes y normalizarlo a mayúsculas. La unicidad SHALL ignorar diferencias entre mayúsculas y minúsculas y SHALL aplicar también al editar un Squad.

#### Scenario: Se normaliza un código válido

- **WHEN** el Chapter Lead ingresa un código alfanumérico con espacios sobrantes o minúsculas
- **THEN** el sistema guarda el código sin espacios sobrantes y en mayúsculas

#### Scenario: Se ingresa un código con caracteres no permitidos

- **WHEN** el Chapter Lead envía un código que contiene espacios internos, guiones, símbolos o caracteres no alfanuméricos
- **THEN** el sistema rechaza el valor, muestra un mensaje de formato y no crea ni modifica el Squad

#### Scenario: El código ya está registrado

- **WHEN** el Chapter Lead registra o edita un Squad usando un código que pertenece a otro Squad, sin importar sus mayúsculas
- **THEN** el sistema rechaza la operación con un conflicto de duplicidad y conserva los datos existentes

### Requirement: El sistema consulta Squads

El sistema SHALL permitir consultar un listado y el detalle de Squads. El listado SHALL permitir filtrar por estado `Activo`, `Inactivo` o `Todos`, mostrar por defecto los activos y presentar código, nombre, tribu, PO y estado. Los Squads inactivos SHALL permanecer consultables para conservar la trazabilidad.

#### Scenario: Se consulta el listado activo

- **WHEN** el Chapter Lead abre el módulo de Squads
- **THEN** el sistema muestra únicamente los Squads activos por defecto, ordenados de forma consistente por nombre o código

#### Scenario: Se consulta el listado inactivo

- **WHEN** el Chapter Lead selecciona el filtro `Inactivo`
- **THEN** el sistema muestra únicamente Squads desactivados y permite abrir su detalle

#### Scenario: Se consulta el detalle

- **WHEN** el Chapter Lead selecciona un Squad del listado
- **THEN** el sistema muestra código, nombre, tribu, PO y estado actual, incluso si el Squad está inactivo

### Requirement: Eliminar un Squad significa desactivarlo

El sistema SHALL interpretar la eliminación como una desactivación lógica. La operación SHALL conservar el registro, cambiar su estado a `Inactivo` y mantenerlo disponible para consultas históricas. El sistema SHALL permitir reactivar un Squad inactivo sin cambiar su identificador ni su código.

#### Scenario: Se desactiva un Squad

- **WHEN** el Chapter Lead confirma la eliminación de un Squad activo
- **THEN** el sistema cambia su estado a `Inactivo`, no borra sus datos y lo excluye del listado activo

#### Scenario: Se reactiva un Squad

- **WHEN** el Chapter Lead confirma la reactivación de un Squad inactivo
- **THEN** el sistema cambia su estado a `Activo`, conserva sus datos e identificador y lo incluye nuevamente en el listado activo

#### Scenario: Se intenta eliminar un Squad inexistente

- **WHEN** el Chapter Lead solicita eliminar un identificador que no existe
- **THEN** el sistema informa que el Squad no existe y no modifica ningún registro

### Requirement: La administración de Squads es responsive y accesible

El listado, detalle y formularios SHALL funcionar en móvil, tablet y escritorio siguiendo `docs/design-system.md`. Los controles SHALL tener etiquetas asociadas, foco visible, navegación por teclado, estados de carga, errores comprensibles y confirmación para desactivar o reactivar.

#### Scenario: Se administra un Squad desde móvil

- **WHEN** el Chapter Lead consulta o administra Squads en un viewport móvil
- **THEN** los campos, filtros, listado y acciones permanecen utilizables sin desplazamiento horizontal de la página

#### Scenario: Falla una operación de la API

- **WHEN** una operación de consulta o guardado falla
- **THEN** el sistema muestra un mensaje no técnico, evita operaciones duplicadas y conserva los datos ingresados cuando corresponda
