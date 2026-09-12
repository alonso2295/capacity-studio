# assignments Specification

## Purpose
TBD - created by archiving change track-member-resignation. Update Purpose after archive.

## Requirements

### Requirement: El sistema permite marcar la renuncia en una asignación

El sistema SHALL permitir que un usuario autorizado indique si el miembro renunció en una asignación mediante el campo `member_resigned`. El valor SHALL pertenecer a la asignación y no al miembro; SHALL ser `false` por defecto en nuevas asignaciones y en registros existentes migrados. El usuario SHALL poder activar o desactivar la marca al crear o editar una asignación. Activar la marca SHALL NOT cambiar automáticamente la fecha fin, el estado del miembro, el proveedor capturado, los Squads ni cualquier otro dato.

#### Scenario: Nueva asignación sin marca de renuncia

- **WHEN** un Chapter Lead crea una asignación válida y no indica que el miembro renunció
- **THEN** el sistema guarda `member_resigned` como `false`

#### Scenario: Marcar una asignación por renuncia

- **WHEN** un Chapter Lead activa `Miembro renunció` en una asignación
- **THEN** el sistema guarda la asignación con `member_resigned` igual a `true` y conserva el resto de sus datos sin cambios

#### Scenario: Desmarcar una asignación

- **WHEN** un Chapter Lead desactiva `Miembro renunció` en una asignación marcada
- **THEN** el sistema guarda `member_resigned` como `false` sin modificar la fecha fin ni los demás datos

### Requirement: El sistema conserva la fecha final y permite registrar un reemplazo independiente

El sistema SHALL permitir editar la fecha fin de una asignación marcada para establecer el último día laboral del miembro, respetando la validación de que no sea anterior a la fecha de inicio. Marcar la renuncia SHALL NOT actualizar automáticamente esa fecha. La asignación marcada SHALL continuar consumiendo su porcentaje de capacidad hasta su fecha fin inclusive. Una persona contratada como reemplazo SHALL registrarse mediante una nueva asignación independiente, sin requerir un vínculo con la asignación marcada y sin modificarla.

#### Scenario: Ajustar el último día laboral

- **WHEN** un Chapter Lead marca una asignación como renuncia y actualiza su fecha fin al último día laboral
- **THEN** el sistema guarda ambas modificaciones y la asignación deja de consumir capacidad a partir del día siguiente a la nueva fecha fin

#### Scenario: Renuncia sin actualización automática de fecha

- **WHEN** un Chapter Lead activa la marca de renuncia sin cambiar la fecha fin
- **THEN** el sistema conserva la fecha fin existente y mantiene la asignación vigente hasta esa fecha inclusive

#### Scenario: Registrar el reemplazo

- **WHEN** un Chapter Lead crea una asignación para otra persona durante el tiempo restante del servicio
- **THEN** el sistema crea una nueva asignación independiente y conserva la asignación marcada con su miembro, proveedor, fechas y porcentaje propios

### Requirement: El sistema permite consultar y visualizar las asignaciones marcadas

El listado SHALL aceptar un filtro opcional de renuncia con tres estados: todas, `Miembro renunció` y `Miembro activo en la asignación`. Al seleccionar un estado, el sistema SHALL mostrar únicamente asignaciones cuyo `member_resigned` coincida con el valor solicitado. La tabla y la vista de cards SHALL mostrar una etiqueta visual cuando `member_resigned` sea `true`; las cards SHALL mantener las restricciones visuales existentes y no SHALL mostrar los nombres de Squad dentro del contenido de cada card.

#### Scenario: Filtrar asignaciones con renuncia

- **WHEN** el usuario selecciona el filtro `Miembro renunció`
- **THEN** el listado muestra únicamente asignaciones con `member_resigned` igual a `true`

#### Scenario: Filtrar asignaciones sin renuncia

- **WHEN** el usuario selecciona el filtro `Miembro activo en la asignación`
- **THEN** el listado muestra únicamente asignaciones con `member_resigned` igual a `false`

#### Scenario: Mostrar la etiqueta en tabla y cards

- **WHEN** una asignación marcada aparece en cualquiera de las vistas
- **THEN** el sistema muestra una etiqueta legible `Miembro renunció` asociada a esa asignación

#### Scenario: Filtro combinado

- **WHEN** el usuario combina el filtro de renuncia con búsqueda, proveedor, rol, Squad Asignado o fechas
- **THEN** el sistema muestra únicamente las asignaciones que cumplen todos los criterios activos y conserva los filtros al cambiar entre tabla y cards

### Requirement: El sistema protege la marca según los permisos existentes

Las operaciones de consulta, creación y edición del campo `member_resigned` SHALL conservar la autorización existente de asignaciones: solo un usuario con rol `Chapter Lead` podrá ejecutarlas. Los clientes que no envíen el campo al actualizar una asignación SHALL conservar su valor actual.

#### Scenario: Usuario sin permisos

- **WHEN** un usuario sin rol `Chapter Lead` intenta consultar o cambiar la marca
- **THEN** la API rechaza la operación con el estado de autorización correspondiente y no modifica la asignación

#### Scenario: Actualización parcial compatible

- **WHEN** una edición actualiza fechas, porcentaje o proyecto sin incluir `member_resigned`
- **THEN** el sistema conserva el valor existente de la marca

### Requirement: El sistema permite crear una asignación

El sistema SHALL permitir a un usuario autorizado crear una asignación indicando un miembro activo, un Squad Asignado activo, un Squad Ejecutor activo, un código de proyecto, una fecha de inicio, una fecha de fin y un porcentaje de asignación entre 0 y 100 inclusive. Al iniciar el registro, el Squad Ejecutor SHALL tomar por defecto el mismo valor del Squad Asignado; el usuario SHALL poder seleccionar otro Squad Ejecutor. El código de proyecto SHALL aceptar letras, números, espacios, guiones, signos y otros símbolos imprimibles; SHALL recortar espacios externos y no SHALL aceptar un valor vacío.

#### Scenario: Creación exitosa con miembro tercerizado

- **WHEN** un Chapter Lead selecciona un miembro activo tercerizado, un Squad Asignado activo, conserva el Squad Ejecutor por defecto, ingresa un código de proyecto válido, fechas válidas y un porcentaje dentro del rango
- **THEN** el sistema crea la asignación con ambos Squads iguales y guarda el proveedor asociado al miembro en ese momento junto con el resto de los datos de la asignación

#### Scenario: Creación con Squad Ejecutor diferente

- **WHEN** un Chapter Lead selecciona un Squad Asignado y elige explícitamente otro Squad Ejecutor activo
- **THEN** el sistema crea la asignación conservando ambos identificadores de Squad de forma independiente

#### Scenario: Creación exitosa con miembro de planilla

- **WHEN** un Chapter Lead selecciona un miembro activo de planilla y completa los demás campos válidos
- **THEN** el sistema crea la asignación con proveedor nulo y muestra que el miembro no tiene proveedor aplicable

#### Scenario: Rechazo de datos incompletos o inválidos

- **WHEN** faltan el miembro, Squad Asignado, Squad Ejecutor, código de proyecto, fecha de inicio, fecha de fin o porcentaje, o el porcentaje está fuera de 0 a 100, o la fecha final es anterior a la inicial
- **THEN** el sistema rechaza la operación con un error asociado al campo correspondiente y no crea la asignación

### Requirement: El sistema conserva los datos contextuales de la asignación

Al crear una asignación, el sistema SHALL capturar el proveedor vigente del miembro como parte de la asignación. Las consultas SHALL mostrar DNI, nombre completo, proveedor capturado, rol y seniority del miembro, además del Squad Asignado, Squad Ejecutor, proyecto, fechas y porcentaje. Un cambio posterior de proveedor del miembro SHALL NOT modificar el proveedor guardado en asignaciones existentes.

#### Scenario: Cambio posterior de proveedor

- **WHEN** el proveedor vigente de un miembro cambia después de crear una asignación
- **THEN** la asignación existente continúa mostrando el proveedor capturado al momento de su creación

#### Scenario: Datos cargados al seleccionar un miembro

- **WHEN** el usuario busca y selecciona un colaborador en el modal
- **THEN** el sistema carga automáticamente y en modo de solo lectura su DNI, nombre completo, proveedor vigente, rol profesional y seniority

### Requirement: El sistema evita superar el 100% de capacidad en fechas superpuestas

El sistema SHALL permitir varias asignaciones para un mismo miembro, pero SHALL rechazar una creación o edición si la suma de sus porcentajes de asignaciones existentes y la nueva asignación supera 100% en cualquier día del rango inclusivo. La asignación que se está editando no SHALL contabilizarse dos veces. Las asignaciones de otros miembros no SHALL afectar la validación.

#### Scenario: Varias asignaciones compatibles

- **WHEN** un miembro tiene una asignación de 60% y se registra otra de 40% en un rango que se superpone
- **THEN** el sistema permite guardar la segunda asignación

#### Scenario: Solapamiento que supera el límite

- **WHEN** un miembro tiene asignaciones que totalizan 80% en un día y se intenta agregar otra de 21% que incluye ese día
- **THEN** el sistema rechaza la operación con un conflicto de capacidad y no guarda cambios

#### Scenario: Rangos sin solapamiento

- **WHEN** una nueva asignación utiliza fechas posteriores al fin de todas las asignaciones existentes del miembro
- **THEN** el sistema valida el porcentaje de forma independiente y permite guardar aunque la suma de otros periodos sea superior a 100%

### Requirement: El sistema permite consultar y filtrar asignaciones

El sistema SHALL ofrecer un listado de asignaciones con búsqueda por nombre completo o DNI y filtros por proveedor capturado, rol profesional, Squad Asignado, fecha de inicio y fecha de fin. El filtro de Squad SHALL aplicarse al Squad Asignado; el Squad Ejecutor se visualizará y podrá explorarse mediante las subpestañas de cards, pero no agregará un filtro independiente en esta versión. Los filtros SHALL poder combinarse, SHALL conservarse al cambiar de vista y SHALL mostrar resultados consistentes en la tabla y en las cards. Los filtros de fecha SHALL ser inclusivos y SHALL considerar una asignación coincidente cuando su rango se intersecte con el rango filtrado, incluyendo las fechas límite: `assignment.end_date >= filter.start_date` y `assignment.start_date <= filter.end_date`.

#### Scenario: Búsqueda por nombre o DNI

- **WHEN** el usuario escribe parte del nombre completo o DNI
- **THEN** el listado muestra únicamente asignaciones cuyos datos del miembro coinciden con la búsqueda, sin distinguir mayúsculas y minúsculas para el nombre

#### Scenario: Filtros combinados

- **WHEN** el usuario selecciona un proveedor, rol y Squad Asignado, define fechas de inicio y fin además de una búsqueda
- **THEN** el sistema muestra solo las asignaciones que cumplen simultáneamente todos los criterios activos

#### Scenario: Filtro de Squad Asignado compartido entre vistas

- **WHEN** el usuario selecciona un Squad Asignado y cambia entre tabla, cards de Squad Asignado y cards de Squad Ejecutor
- **THEN** el sistema conserva el filtro de Squad Asignado y muestra en ambas pestañas únicamente las asignaciones que cumplen ese filtro

#### Scenario: Filtros de fecha inclusivos

- **WHEN** el usuario filtra un rango de fechas y una asignación comienza o termina exactamente en una de las fechas seleccionadas
- **THEN** el sistema incluye esa asignación porque las fechas límite del filtro son inclusivas

#### Scenario: Sin resultados

- **WHEN** los criterios activos no coinciden con ninguna asignación
- **THEN** el sistema muestra un estado vacío explicando que no hay asignaciones para esos filtros y ofrece limpiar los filtros

### Requirement: El sistema ofrece tabla y vista de cards

El sistema SHALL ofrecer una vista tabular para comparar asignaciones y una vista de cards minimalista orientada a entender qué perfiles están asignados a cada Squad. La vista de cards SHALL incluir subpestañas `Squad Asignado` y `Squad Ejecutor`, iniciar en `Squad Asignado` y agrupar visualmente las asignaciones por el nombre del campo correspondiente a la pestaña activa. No SHALL mostrar códigos ni nombres de Squad dentro del contenido de ninguna card. En la parte superior de cada grupo SHALL mostrar un resumen agregado de los perfiles por rol profesional, calculado sobre las asignaciones visibles de la pestaña activa y expresado con cantidades y nombres de rol, por ejemplo `3 Data Engineers, 2 Data Architects`. Las subpestañas y el encabezado de cada grupo SHALL conservar el contexto de la perspectiva activa. Cada card SHALL mostrar, como mínimo, miembro, DNI, proveedor capturado, rol, seniority, proyecto, fechas y porcentaje en una composición compacta.

#### Scenario: Cambio entre tabla y cards

- **WHEN** el usuario cambia el selector de vista
- **THEN** el sistema cambia la presentación sin perder la búsqueda ni los filtros aplicados

#### Scenario: Cambio entre perspectivas de Squad

- **WHEN** el usuario cambia de la subpestaña `Squad Asignado` a `Squad Ejecutor` o viceversa
- **THEN** el sistema actualiza el agrupamiento, los nombres de los grupos y el resumen de roles sin perder los filtros activos ni recargar datos innecesariamente

#### Scenario: Vista de cards agrupada por Squad

- **WHEN** existen asignaciones para dos o más Squads
- **THEN** la vista de cards presenta secciones distinguibles por el Squad de la perspectiva activa, muestra en cada encabezado el resumen de perfiles agrupados por rol, no muestra códigos de Squad y presenta los perfiles en cards compactas con sus datos de capacidad
- **AND** cada card omite los nombres de Squad, manteniendo ese contexto únicamente en la subpestaña y el encabezado de su grupo

### Requirement: El sistema permite editar asignaciones

El sistema SHALL permitir editar el Squad Asignado, el Squad Ejecutor, código de proyecto, fechas y porcentaje de una asignación existente. El miembro y el proveedor capturado SHALL mostrarse como contexto de la asignación y no SHALL cambiarse silenciosamente durante una edición; para asignar otro miembro se deberá crear una nueva asignación. La edición SHALL volver a ejecutar la validación de capacidad excluyendo la asignación actual.

#### Scenario: Edición compatible

- **WHEN** un Chapter Lead modifica cualquiera de los Squads, fechas, proyecto o porcentaje sin superar la capacidad disponible
- **THEN** el sistema actualiza la asignación y conserva su identificador, miembro y proveedor capturado

#### Scenario: Edición con conflicto

- **WHEN** una edición provoca que la capacidad del miembro supere 100% en alguna fecha
- **THEN** el sistema rechaza el cambio, conserva los valores anteriores y muestra el conflicto de capacidad

### Requirement: El sistema permite eliminar asignaciones

El sistema SHALL permitir eliminar físicamente una asignación ingresada incorrectamente. La acción SHALL requerir confirmación explícita y, después de completarse, la asignación SHALL desaparecer de la tabla y de la vista de cards y SHALL dejar de consumir capacidad.

#### Scenario: Eliminación confirmada

- **WHEN** un Chapter Lead confirma la eliminación de una asignación
- **THEN** el sistema elimina el registro, actualiza ambas vistas y recalcula la capacidad disponible del miembro

#### Scenario: Eliminación cancelada

- **WHEN** el usuario cancela la confirmación
- **THEN** el sistema conserva la asignación sin cambios

### Requirement: El sistema administra el modal de alta y edición de forma accesible

El sistema SHALL abrir el alta y la edición en una ventana modal con título, cierre por botón identificable, foco gestionado, navegación por teclado y mensajes de error asociados a sus campos. El modal SHALL permitir buscar colaboradores por nombre o DNI antes de seleccionar uno y SHALL mostrar estados de carga, error y guardado.

#### Scenario: Búsqueda y selección en el modal

- **WHEN** el usuario escribe un nombre o DNI en el buscador del modal
- **THEN** el sistema muestra colaboradores activos coincidentes y permite seleccionar uno para cargar sus datos contextuales

#### Scenario: Cierre sin guardar

- **WHEN** el usuario cierra el modal o cancela antes de guardar
- **THEN** el sistema no crea ni modifica una asignación y devuelve el foco al control que abrió la ventana

### Requirement: El sistema protege la capacidad por rol y consistencia de referencias

Todas las operaciones de asignaciones SHALL requerir el rol `Chapter Lead`. El backend SHALL validar que el miembro, el Squad Asignado y el Squad Ejecutor existan y estén activos al crear una asignación, y SHALL rechazar referencias inválidas sin exponer credenciales ni permitir acceso directo del navegador a Supabase.

#### Scenario: Usuario sin permisos

- **WHEN** un usuario que no es Chapter Lead intenta consultar o modificar asignaciones
- **THEN** la API responde con acceso no autorizado y el frontend muestra el estado de acceso restringido

#### Scenario: Referencias inactivas

- **WHEN** se intenta crear una asignación usando un miembro, Squad Asignado o Squad Ejecutor inactivo
- **THEN** la API rechaza la operación indicando que la referencia no está disponible
