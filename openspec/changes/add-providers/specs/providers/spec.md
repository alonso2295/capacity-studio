## Purpose

Permitir que Capacity Studio mantenga un catálogo confiable de empresas
proveedoras, con información de contacto, estado operativo y preservación de
referencias históricas.

## ADDED Requirements

### Requirement: El sistema registra proveedores con datos válidos

El sistema SHALL permitir crear un proveedor con razón social, RUC, focal point,
número celular opcional y estado. La razón social, el RUC y el focal point SHALL
ser obligatorios. Un proveedor nuevo SHALL iniciar en estado `activo` y el
registro SHALL permanecer separado de cualquier cuenta de acceso.

#### Scenario: Se registra un proveedor válido

- **WHEN** se envían una razón social, un RUC y un focal point válidos, con o sin número celular
- **THEN** el sistema crea un proveedor activo y devuelve su identificador y sus datos normalizados

#### Scenario: Faltan campos obligatorios

- **WHEN** se intenta crear un proveedor sin razón social, RUC o focal point
- **THEN** el sistema rechaza la operación, identifica cada campo faltante y no persiste el proveedor

#### Scenario: El número celular es omitido

- **WHEN** se crea un proveedor con los campos obligatorios válidos y sin número celular
- **THEN** el sistema permite el registro y conserva el celular como vacío o nulo

### Requirement: El RUC es alfanumérico y único

El sistema SHALL conservar el RUC como texto. El valor SHALL contener únicamente
caracteres alfanuméricos, eliminar espacios sobrantes en los extremos,
normalizarse a mayúsculas y ser único sin distinguir mayúsculas/minúsculas.

#### Scenario: Se normaliza un RUC válido

- **WHEN** se envía un RUC alfanumérico con espacios exteriores o letras minúsculas
- **THEN** el sistema guarda y devuelve el RUC sin espacios exteriores y en mayúsculas

#### Scenario: Se intenta registrar un RUC repetido

- **WHEN** se envía un RUC que ya pertenece a otro proveedor, aunque cambie el uso de mayúsculas
- **THEN** el sistema rechaza la operación con un conflicto de duplicidad y conserva intacto el registro existente

#### Scenario: El RUC contiene caracteres no permitidos

- **WHEN** se envía un RUC vacío o con símbolos que no son alfanuméricos
- **THEN** el sistema rechaza la operación con un error asociado al RUC

### Requirement: El sistema consulta proveedores y sus estados

El sistema SHALL permitir consultar el listado y el detalle de proveedores. El
listado administrativo SHALL permitir distinguir y filtrar proveedores activos
e inactivos. El catálogo destinado a seleccionar proveedores para nuevos
miembros SHALL continuar mostrando únicamente proveedores activos.

#### Scenario: Se consulta el listado administrativo

- **WHEN** se solicita el listado de proveedores sin restringir el estado
- **THEN** el sistema devuelve proveedores activos e inactivos con su estado visible

#### Scenario: Se filtra por estado

- **WHEN** se solicita el listado filtrando por `activo` o `inactivo`
- **THEN** el sistema devuelve únicamente proveedores que coinciden con el filtro

#### Scenario: Se consulta el detalle de un proveedor inactivo

- **WHEN** se solicita un proveedor existente que está inactivo
- **THEN** el sistema devuelve sus datos y su estado sin eliminarlo ni ocultarlo del detalle

### Requirement: El sistema permite editar proveedores

El sistema SHALL permitir actualizar razón social, RUC, focal point, número
celular y estado. La actualización SHALL aplicar las mismas validaciones y
normalizaciones del registro inicial. Un conflicto de RUC SHALL impedir la
actualización completa.

#### Scenario: Se actualizan datos de contacto

- **WHEN** se edita un proveedor con una razón social y focal point válidos, con o sin celular
- **THEN** el sistema guarda los nuevos datos y mantiene el mismo identificador del proveedor

#### Scenario: Se cambia el RUC por uno ya utilizado

- **WHEN** se edita un proveedor usando el RUC de otro proveedor
- **THEN** el sistema rechaza la actualización por duplicidad y conserva todos los datos anteriores

### Requirement: Eliminar significa desactivar lógicamente

El sistema SHALL implementar la eliminación de un proveedor como un cambio a
estado `inactivo`. La desactivación SHALL conservar el registro, su
identificador y sus relaciones históricas. Un proveedor inactivo SHALL dejar de
estar disponible para nuevas afiliaciones de miembros tercerizados.

#### Scenario: Se desactiva un proveedor

- **WHEN** se solicita eliminar un proveedor activo
- **THEN** el sistema lo marca como inactivo sin borrar sus datos ni sus afiliaciones históricas

#### Scenario: Se reactiva un proveedor

- **WHEN** se cambia el estado de un proveedor inactivo a activo
- **THEN** el sistema lo marca como activo y vuelve a incluirlo en el catálogo para nuevas afiliaciones

#### Scenario: Se intenta usar un proveedor inactivo para un nuevo miembro

- **WHEN** se intenta asociar un nuevo miembro tercerizado con un proveedor inactivo
- **THEN** el sistema rechaza la asociación y conserva el proveedor inactivo sin cambios

### Requirement: El módulo de proveedores es independiente de la autenticación

El registro y mantenimiento de proveedores SHALL tratar los datos de la empresa
como una entidad de negocio independiente. Crear o editar un proveedor SHALL
NOT crear, modificar ni eliminar cuentas, credenciales, roles o permisos de
acceso.

#### Scenario: Se crea un proveedor sin cuenta de usuario

- **WHEN** se registra un proveedor con sus datos válidos
- **THEN** el sistema crea únicamente el registro del proveedor y no crea una cuenta de acceso para el focal point

#### Scenario: Se edita el focal point

- **WHEN** se cambia el texto del focal point de un proveedor
- **THEN** el sistema actualiza el contacto del proveedor sin interpretarlo como usuario autenticado ni cambiar permisos

### Requirement: El CRUD es responsive y accesible

La interfaz del CRUD SHALL funcionar en móvil, tableta y escritorio siguiendo
`docs/design-system.md`. Los formularios SHALL mostrar etiquetas visibles,
obligatoriedad, errores junto al campo, estados de carga y confirmación de
éxito; las acciones de desactivar y reactivar SHALL comunicar claramente el
estado resultante.

#### Scenario: Se administra un proveedor desde móvil

- **WHEN** se abre el listado o formulario en un viewport móvil
- **THEN** el contenido se presenta sin desplazamiento horizontal y las acciones principales permanecen utilizables

#### Scenario: Falla una operación del CRUD

- **WHEN** una solicitud de creación, edición, desactivación o reactivación falla
- **THEN** la interfaz muestra un mensaje comprensible, evita duplicar el envío y conserva los datos ingresados cuando corresponda
