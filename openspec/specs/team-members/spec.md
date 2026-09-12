# team-members Specification

## Purpose
Permitir que un Chapter Lead registre de forma consistente a los miembros del equipo que posteriormente serán asignados a uno o más Squads, manteniendo separadas sus características laborales de sus permisos de acceso.

## Requirements

### Requirement: El Chapter Lead puede administrar miembros del equipo

El sistema SHALL mostrar las operaciones de administración de miembros únicamente a usuarios autenticados con rol `Chapter Lead`. Estas operaciones SHALL incluir registrar, consultar, editar, desactivar y reactivar miembros. La administración de un miembro SHALL ser independiente de la creación de una cuenta de usuario de la aplicación.

#### Scenario: Chapter Lead accede al módulo

- **WHEN** un usuario autenticado con rol `Chapter Lead` navega al módulo de miembros
- **THEN** el sistema muestra el listado de miembros y permite iniciar el registro, consulta, edición, desactivación o reactivación según el estado del miembro

#### Scenario: Usuario sin permiso intenta administrar un miembro

- **WHEN** un usuario con rol `Focal Proveedor` o `Miembro de Equipo` intenta consultar o ejecutar una operación sobre miembros
- **THEN** el sistema rechaza la operación y no expone ni modifica ningún miembro

### Requirement: El formulario captura los datos del miembro

El sistema SHALL permitir registrar los siguientes datos: DNI, nombre, apellido paterno, apellido materno, correo, celular, fecha de nacimiento, tipo de vínculo, proveedor, rol profesional y seniority. El campo `Rol profesional` SHALL ser distinto del rol de acceso a la aplicación.

En la primera versión, DNI, nombre, apellido paterno, correo, fecha de nacimiento, tipo de vínculo, rol profesional y seniority SHALL ser obligatorios. Apellido materno y celular SHALL ser opcionales. El proveedor SHALL ser obligatorio únicamente para miembros tercerizados.

#### Scenario: Se visualizan los campos del formulario

- **WHEN** el Chapter Lead abre el formulario de registro
- **THEN** el sistema muestra todos los campos definidos, sus etiquetas y el indicador de obligatoriedad correspondiente

#### Scenario: Se registra un miembro con datos válidos

- **WHEN** el Chapter Lead completa los campos obligatorios, selecciona un rol profesional activo y envía el formulario
- **THEN** el sistema crea un miembro activo con los datos normalizados y muestra una confirmación de registro exitoso

### Requirement: El tipo de vínculo controla el proveedor

El sistema SHALL ofrecer únicamente las opciones `Planilla` y `Tercerizado` para el tipo de vínculo. Para un miembro `Tercerizado`, el proveedor SHALL seleccionarse desde proveedores activos. Para un miembro `Planilla`, el proveedor SHALL quedar vacío y no SHALL ser requerido.

#### Scenario: Se selecciona Planilla

- **WHEN** el Chapter Lead selecciona `Planilla`
- **THEN** el sistema deshabilita u oculta el selector de proveedor, limpia cualquier proveedor previamente seleccionado y permite continuar sin proveedor

#### Scenario: Se selecciona Tercerizado sin proveedor

- **WHEN** el Chapter Lead selecciona `Tercerizado` y envía el formulario sin proveedor
- **THEN** el sistema rechaza el envío, muestra un error asociado al campo proveedor y no crea el miembro

#### Scenario: Se registra un tercerizado con proveedor

- **WHEN** el Chapter Lead selecciona `Tercerizado`, elige un proveedor activo y completa el resto de campos válidos
- **THEN** el sistema crea el miembro y registra su vínculo inicial con ese proveedor para permitir cambios históricos posteriores

### Requirement: El seniority y el rol profesional usan catálogos válidos

El sistema SHALL mostrar `Seniority` como un selector con exactamente las opciones `Medium` y `Senior`. El selector de `Rol profesional` SHALL mostrar únicamente roles profesionales activos del catálogo correspondiente y SHALL permitir una sola selección.

#### Scenario: Se selecciona un seniority válido

- **WHEN** el Chapter Lead abre el selector de seniority
- **THEN** el sistema muestra `Medium` y `Senior` como opciones disponibles

#### Scenario: Se intenta enviar un seniority no permitido

- **WHEN** una solicitud contiene un valor de seniority distinto de `Medium` o `Senior`
- **THEN** el backend rechaza la solicitud con un error de validación y no persiste el miembro

### Requirement: El sistema valida y normaliza los datos

El sistema SHALL validar los campos antes de persistirlos. DNI SHALL aceptar el formato de identificación definido para el mercado local, conservarse como texto y ser único. El correo SHALL validarse como correo electrónico, normalizarse sin distinguir mayúsculas y ser único. La fecha de nacimiento SHALL ser una fecha válida y no futura. Los valores textuales SHALL eliminar espacios sobrantes.

#### Scenario: Faltan datos obligatorios

- **WHEN** el Chapter Lead envía el formulario con uno o más campos obligatorios vacíos
- **THEN** el sistema no envía o no persiste el registro y muestra un mensaje específico junto a cada campo inválido

#### Scenario: DNI o correo ya existen

- **WHEN** el Chapter Lead envía un DNI o correo que ya pertenece a otro miembro
- **THEN** el sistema rechaza el registro, informa que el dato ya está registrado y conserva intactos los datos existentes

#### Scenario: Se envía una fecha de nacimiento futura

- **WHEN** el formulario contiene una fecha de nacimiento posterior a la fecha actual
- **THEN** el sistema muestra un error de fecha y no crea el miembro

### Requirement: El sistema consulta miembros

El sistema SHALL permitir consultar el listado y el detalle de miembros. El listado SHALL permitir filtrar por estado `Activo`, `Inactivo` o `Todos`, y SHALL mostrar como mínimo DNI, nombre completo, tipo de vínculo, proveedor vigente cuando corresponda, rol profesional, seniority y estado. La consulta SHALL incluir miembros inactivos para preservar la trazabilidad del registro.

#### Scenario: Se consulta el listado de miembros

- **WHEN** un Chapter Lead abre el módulo de miembros
- **THEN** el sistema muestra los miembros registrados y su estado actual, incluyendo por defecto los miembros activos

#### Scenario: Se filtra por miembros inactivos

- **WHEN** el Chapter Lead selecciona el filtro `Inactivo`
- **THEN** el sistema muestra únicamente miembros desactivados y permite abrir su detalle

#### Scenario: Se consulta el detalle de un miembro

- **WHEN** el Chapter Lead selecciona un miembro del listado
- **THEN** el sistema muestra todos sus datos vigentes, su estado y el historial de afiliaciones con proveedores cuando exista

### Requirement: El sistema permite editar miembros

El sistema SHALL permitir que un Chapter Lead edite los datos de un miembro existente, aplicando las mismas reglas de obligatoriedad, formato, normalización, catálogos y unicidad definidas para el registro. La edición SHALL conservar el identificador del miembro y no SHALL crear una cuenta de autenticación.

#### Scenario: Se editan datos válidos de un miembro

- **WHEN** el Chapter Lead modifica uno o más datos con valores válidos y guarda los cambios
- **THEN** el sistema actualiza el mismo miembro, mantiene su estado y muestra una confirmación de actualización exitosa

#### Scenario: La edición genera duplicidad

- **WHEN** el Chapter Lead cambia el DNI o correo por un valor que ya pertenece a otro miembro
- **THEN** el sistema rechaza la edición, informa el conflicto y conserva los datos anteriores del miembro

#### Scenario: Se cambia el proveedor de un tercerizado

- **WHEN** el Chapter Lead cambia el proveedor de un miembro `Tercerizado` por otro proveedor activo
- **THEN** el sistema cierra la afiliación vigente, registra la nueva afiliación con su fecha de inicio y conserva ambas relaciones en el historial

### Requirement: Eliminar un miembro significa desactivarlo

El sistema SHALL interpretar la eliminación de un miembro como una desactivación lógica. La operación SHALL conservar el registro y sus relaciones históricas, cambiar su estado a `Inactivo` y evitar que el miembro sea seleccionado para nuevas asignaciones mientras permanezca inactivo. El sistema SHALL permitir reactivar un miembro inactivo sin cambiar su identificador.

#### Scenario: Se desactiva un miembro

- **WHEN** el Chapter Lead confirma la eliminación de un miembro activo
- **THEN** el sistema cambia su estado a `Inactivo`, no borra sus datos y lo mantiene consultable en el listado de inactivos

#### Scenario: Se intenta asignar un miembro inactivo

- **WHEN** otro flujo intenta seleccionar un miembro con estado `Inactivo` para una nueva asignación
- **THEN** el sistema rechaza la selección y conserva disponibles sus datos históricos para consulta

#### Scenario: Se reactiva un miembro

- **WHEN** el Chapter Lead confirma la reactivación de un miembro inactivo
- **THEN** el sistema cambia su estado a `Activo`, conserva sus datos e historial y permite considerarlo nuevamente para nuevas asignaciones

### Requirement: El registro es responsive y accesible

El formulario SHALL funcionar en anchos móviles, tabletas y escritorio, siguiendo `docs/design-system.md` y las reglas de la capability `design-system`. Los controles SHALL tener etiquetas asociadas, estados de error visibles, navegación por teclado y mensajes de éxito o error comprensibles.

#### Scenario: Registro desde un dispositivo móvil

- **WHEN** el Chapter Lead abre el formulario en un viewport móvil
- **THEN** los campos se reorganizan en una sola columna, permanecen utilizables sin desplazamiento horizontal y el botón de envío sigue siendo accesible

#### Scenario: Error de la API durante el registro

- **WHEN** la API falla después de que el usuario envía datos válidos
- **THEN** el sistema muestra un mensaje de error no técnico, evita duplicar el envío y conserva los datos ingresados para que puedan corregirse o reintentarse

#### Scenario: Administración desde un dispositivo móvil

- **WHEN** el Chapter Lead consulta el listado o abre el formulario de edición en un viewport móvil
- **THEN** las acciones, filtros y campos permanecen utilizables sin desplazamiento horizontal y los estados de los miembros son distinguibles
