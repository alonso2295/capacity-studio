## Purpose

Define la gestión interna, segura y responsive de miembros, proveedores, Squads y asignaciones de capacidad mediante rangos de fechas.

## ADDED Requirements

### Requirement: Autenticación de usuarios internos

El sistema SHALL permitir el acceso de usuarios internos mediante email y contraseña. El sistema MUST impedir que una persona no autenticada acceda a módulos protegidos.

#### Scenario: Inicio de sesión válido

- **WHEN** un usuario interno proporciona credenciales válidas
- **THEN** el sistema crea una sesión autenticada y muestra la aplicación según su rol

#### Scenario: Credenciales inválidas

- **WHEN** una persona proporciona un email o contraseña inválidos
- **THEN** el sistema rechaza el acceso sin revelar cuál credencial fue incorrecta

#### Scenario: Acceso sin sesión

- **WHEN** una persona intenta abrir un módulo protegido sin una sesión válida
- **THEN** el sistema bloquea el acceso y solicita autenticación

### Requirement: Cuentas separadas de miembros

El sistema SHALL mantener separadas las cuentas de acceso de los registros de miembros del equipo. Un miembro MUST poder existir sin una cuenta de acceso.

#### Scenario: Miembro sin cuenta

- **WHEN** el Chapter Lead registra un miembro sin crearle acceso
- **THEN** el miembro queda disponible para asignaciones pero no puede iniciar sesión

#### Scenario: Cuenta asociada a miembro

- **WHEN** el Chapter Lead asocia una cuenta al miembro correspondiente
- **THEN** la cuenta puede autenticarse y el sistema identifica al miembro asociado

### Requirement: Roles únicos y permisos por módulo

El sistema SHALL asignar exactamente un rol a cada cuenta activa. Los permisos MUST estar definidos por módulo y acción de lectura o escritura.

#### Scenario: Chapter Lead con alcance global

- **WHEN** un Chapter Lead accede a la aplicación
- **THEN** puede leer y modificar todos los módulos disponibles para su rol

#### Scenario: Focal de Proveedor con alcance limitado

- **WHEN** un Focal Proveedor consulta información
- **THEN** el sistema solo devuelve datos permitidos para su empresa proveedora y sus permisos de lectura

#### Scenario: Miembro de Equipo con alcance limitado

- **WHEN** un Miembro de Equipo consulta asignaciones
- **THEN** el sistema solo devuelve sus propias asignaciones y no permite modificaciones

#### Scenario: Permiso de escritura insuficiente

- **WHEN** un usuario intenta ejecutar una acción de escritura que su rol no permite
- **THEN** el sistema rechaza la acción aunque la interfaz haya recibido una solicitud directa

### Requirement: Administración por Chapter Lead

El sistema SHALL permitir que el Chapter Lead administre usuarios, roles, permisos, miembros, proveedores, Squads, afiliaciones y asignaciones.

#### Scenario: Crear usuario y asignar rol

- **WHEN** el Chapter Lead crea una cuenta y selecciona un rol
- **THEN** la cuenta queda asociada a un único rol y puede acceder según sus permisos

#### Scenario: Desactivar cuenta

- **WHEN** el Chapter Lead desactiva una cuenta
- **THEN** la cuenta no puede iniciar nuevas sesiones y los registros históricos permanecen intactos

### Requirement: Miembros de planilla y tercerizados

El sistema SHALL clasificar cada miembro como `PAYROLL` o `CONTRACTOR`. Una afiliación `CONTRACTOR` MUST estar asociada a una empresa proveedora; una afiliación `PAYROLL` MUST no tener empresa proveedora.

#### Scenario: Registrar tercerizado

- **WHEN** el Chapter Lead registra un miembro tercerizado con proveedor
- **THEN** el sistema guarda la afiliación y permite usarla en asignaciones

#### Scenario: Tercerizado sin proveedor

- **WHEN** se intenta guardar un tercerizado sin empresa proveedora
- **THEN** el sistema rechaza el registro e indica que el proveedor es obligatorio

#### Scenario: Registrar miembro de planilla

- **WHEN** el Chapter Lead registra un miembro de planilla
- **THEN** el sistema guarda la afiliación sin exigir una empresa proveedora

### Requirement: Historial de afiliaciones laborales

El sistema SHALL conservar el historial de afiliaciones de cada miembro mediante periodos de vigencia. Las afiliaciones incompatibles de un mismo miembro MUST no solaparse.

#### Scenario: Cambio de proveedor

- **WHEN** un tercerizado cambia de empresa proveedora en una fecha determinada
- **THEN** el sistema conserva la afiliación anterior y registra una nueva afiliación desde la fecha del cambio

#### Scenario: Afiliaciones solapadas

- **WHEN** se intenta registrar una afiliación que se solapa con otra incompatible del mismo miembro
- **THEN** el sistema rechaza la operación y conserva las afiliaciones existentes

### Requirement: Asignaciones por rango de fechas

El sistema SHALL permitir asignar un miembro a un Squad mediante un rango de fechas y un porcentaje de capacidad. El rango MUST tener una fecha inicial anterior a su fecha final.

#### Scenario: Crear asignación válida

- **WHEN** el Chapter Lead registra un miembro, Squad, rango válido y porcentaje permitido
- **THEN** el sistema crea la asignación y la muestra en las consultas correspondientes

#### Scenario: Rango inválido

- **WHEN** se intenta crear una asignación cuya fecha inicial no es anterior a la fecha final
- **THEN** el sistema rechaza la asignación e informa el error de fechas

#### Scenario: Asignación que cruza cambio de proveedor

- **WHEN** una asignación atraviesa el límite entre dos afiliaciones laborales
- **THEN** el sistema rechaza el rango completo y solicita dividirlo en asignaciones compatibles con cada afiliación

### Requirement: Capacidad acumulada máxima

El sistema SHALL permitir porcentajes de capacidad decimales y SHALL impedir que la suma de capacidades asignadas a un miembro supere el 100% en cualquier punto de los rangos solapados.

#### Scenario: Asignaciones no solapadas

- **WHEN** un miembro tiene asignaciones consecutivas que no se solapan
- **THEN** el sistema permite que cada periodo tenga hasta 100% de capacidad

#### Scenario: Asignaciones parciales válidas

- **WHEN** un miembro tiene asignaciones solapadas cuya suma máxima es igual o menor a 100%
- **THEN** el sistema permite guardar las asignaciones

#### Scenario: Porcentaje decimal

- **WHEN** el Chapter Lead registra una asignación con un porcentaje decimal válido, como 12.5%
- **THEN** el sistema conserva la precisión del porcentaje y lo incluye en el cálculo acumulado

#### Scenario: Exceso de capacidad

- **WHEN** una nueva o modificada asignación hace que la suma supere 100% durante cualquier intervalo
- **THEN** el sistema rechaza la operación e informa el periodo y capacidad excedida

#### Scenario: Cambios concurrentes

- **WHEN** dos operaciones simultáneas intentan aumentar la capacidad del mismo miembro más allá del 100%
- **THEN** el sistema confirma como máximo una combinación válida y rechaza la operación conflictiva

### Requirement: Visibilidad histórica del Focal Proveedor

El sistema SHALL permitir que un Focal Proveedor visualice asignaciones de un miembro únicamente durante los periodos en que ese miembro perteneció a su empresa proveedora.

#### Scenario: Consulta durante afiliación propia

- **WHEN** un Focal Proveedor consulta una asignación dentro del periodo de afiliación del miembro a su proveedor
- **THEN** el sistema muestra la información permitida de esa asignación

#### Scenario: Consulta fuera de afiliación propia

- **WHEN** un Focal Proveedor consulta una asignación fuera del periodo de afiliación del miembro a su proveedor
- **THEN** el sistema oculta la asignación y no revela información del proveedor correspondiente

### Requirement: Vistas y filtros temporales

El sistema SHALL permitir consultar asignaciones por miembro, Squad, proveedor y rango de fechas. Los filtros trimestrales MUST derivarse de la intersección entre el trimestre consultado y los rangos de asignación.

#### Scenario: Consulta por rango personalizado

- **WHEN** un usuario autorizado selecciona un rango de fechas
- **THEN** el sistema muestra las asignaciones que se intersectan con ese rango

#### Scenario: Consulta trimestral

- **WHEN** un usuario autorizado selecciona un trimestre
- **THEN** el sistema muestra las asignaciones activas durante cualquier parte de ese trimestre

### Requirement: Interfaz responsive

El sistema SHALL ofrecer una experiencia usable en pantallas móviles, tabletas y escritorio, manteniendo disponibles las acciones autorizadas y la información esencial.

#### Scenario: Consulta en móvil

- **WHEN** un usuario autorizado abre la vista de asignaciones en una pantalla móvil
- **THEN** el sistema presenta la información en un formato legible sin requerir desplazamiento horizontal de toda la página

#### Scenario: Gestión en escritorio

- **WHEN** el Chapter Lead abre la gestión de asignaciones en una pantalla de escritorio
- **THEN** el sistema permite revisar y editar los campos relevantes de forma eficiente

### Requirement: Conservación histórica

El sistema SHALL conservar las asignaciones, afiliaciones, proveedores y miembros usados en registros históricos. Desactivar una entidad MUST no eliminar ni alterar sus registros históricos.

#### Scenario: Proveedor desactivado

- **WHEN** el Chapter Lead desactiva un proveedor
- **THEN** el proveedor deja de estar disponible para nuevas afiliaciones pero permanece visible en consultas históricas autorizadas

#### Scenario: Miembro desactivado

- **WHEN** el Chapter Lead desactiva un miembro
- **THEN** el miembro no puede recibir nuevas asignaciones pero sus afiliaciones y asignaciones anteriores permanecen consultables según permisos
