## Purpose

Esta capacidad permite consultar y administrar un listado de miembros de equipo
que siga siendo usable cuando aumente el volumen de registros, con búsqueda,
filtros, ordenamiento, paginación y acciones accesibles.

## ADDED Requirements

### Requirement: Listado paginado de miembros

El sistema SHALL mostrar los miembros en una tabla paginada y SHALL devolver el
total de resultados, la página actual, el tamaño de página y el total de páginas.
La página inicial SHALL mostrar miembros activos, manteniendo el comportamiento
actual del filtro de estado. El usuario SHALL poder cambiar el tamaño de página
entre opciones predefinidas y navegar a la página anterior o siguiente cuando
corresponda.

#### Scenario: Carga inicial paginada

- **WHEN** el usuario abre el módulo de miembros sin cambiar filtros
- **THEN** el sistema solicita la primera página de miembros activos y muestra los controles de paginación con sus metadatos

#### Scenario: Navegación entre páginas

- **WHEN** el usuario selecciona otra página o cambia el tamaño de página
- **THEN** el sistema solicita los registros correspondientes, conserva los filtros y el ordenamiento activos, y actualiza la tabla y los metadatos

#### Scenario: Resultado vacío

- **WHEN** la combinación de estado, filtros o página no produce miembros
- **THEN** el sistema muestra un estado vacío claro sin renderizar una tabla sin filas

### Requirement: Búsqueda y filtros combinables

El sistema SHALL permitir buscar por coincidencia parcial, sin distinguir
mayúsculas de minúsculas, en el nombre completo o DNI del miembro. SHALL permitir
filtrar por proveedor y rol profesional, además del filtro existente por estado.
Los filtros SHALL combinarse con lógica AND y SHALL aplicarse en el servidor.
Al cambiar un filtro, el sistema SHALL volver a la primera página.

#### Scenario: Búsqueda por nombre o DNI

- **WHEN** el usuario ingresa texto en el campo de búsqueda
- **THEN** el sistema muestra únicamente miembros cuyo nombre completo o DNI coincide con el texto ingresado

#### Scenario: Filtros combinados

- **WHEN** el usuario selecciona un proveedor y un rol profesional junto con un estado o una búsqueda
- **THEN** el sistema muestra únicamente los miembros que cumplen todos los criterios seleccionados

#### Scenario: Limpieza de filtros

- **WHEN** el usuario limpia la búsqueda y restablece proveedor, rol y estado
- **THEN** el sistema vuelve a consultar la primera página usando únicamente los valores por defecto

### Requirement: Ordenamiento por columnas

El sistema SHALL permitir ordenar las columnas de datos del listado mediante
controles en los encabezados: miembro, DNI, vínculo, proveedor, rol profesional,
seniority y estado. Cada columna SHALL indicar visualmente y mediante atributos
accesibles si está ordenada ascendente o descendentemente. Al cambiar el orden,
el sistema SHALL volver a la primera página y SHALL conservar los filtros.

#### Scenario: Orden ascendente y descendente

- **WHEN** el usuario activa una columna no ordenada o vuelve a activar la columna actualmente ordenada
- **THEN** el sistema alterna entre orden ascendente y descendente, actualiza el indicador accesible y solicita los datos con ese orden

#### Scenario: Ordenamiento estable

- **WHEN** varios miembros tienen el mismo valor en la columna ordenada
- **THEN** el sistema aplica un criterio secundario estable para que el orden no cambie arbitrariamente entre páginas

### Requirement: Acciones de miembro con iconos accesibles

El sistema SHALL representar Editar y la acción de estado Desactivar/Reactivar
como botones de icono, sin eliminar sus funciones actuales. Cada botón SHALL
tener nombre accesible, tooltip o `title`, foco visible y estado deshabilitado
durante una operación en curso. Desactivar SHALL requerir confirmación y SHALL
conservar el registro cambiando únicamente su estado; Reactivar SHALL restaurar
el estado activo. Luego de una acción exitosa, el listado SHALL actualizarse
respetando filtros, orden y página cuando todavía sean válidos.

#### Scenario: Editar desde la tabla

- **WHEN** el usuario activa el botón de editar de un miembro
- **THEN** el sistema navega al formulario de edición de ese miembro

#### Scenario: Desactivar con confirmación

- **WHEN** el usuario activa el botón de desactivar y confirma la operación
- **THEN** el sistema desactiva lógicamente al miembro, muestra su estado actualizado y refresca el listado

#### Scenario: Cancelar desactivación

- **WHEN** el usuario activa el botón de desactivar y cancela la confirmación
- **THEN** el sistema no modifica el miembro ni elimina su fila

#### Scenario: Reactivar miembro inactivo

- **WHEN** el usuario consulta miembros inactivos y activa el botón de reactivar
- **THEN** el sistema vuelve a marcar el miembro como activo y actualiza la vista

### Requirement: Accesibilidad y adaptación responsive del listado

El sistema SHALL mantener etiquetas visibles para búsqueda y filtros, nombres
accesibles para los botones de iconos, navegación por teclado y un indicador de
foco visible. En pantallas pequeñas SHALL evitar desbordamiento horizontal del
contenedor de la página y SHALL mantener utilizables los controles principales.

#### Scenario: Uso con teclado

- **WHEN** el usuario recorre los filtros, encabezados ordenables, paginación y acciones mediante teclado
- **THEN** cada control recibe foco visible y puede activarse sin depender de hover

#### Scenario: Vista móvil

- **WHEN** el usuario abre el listado en una pantalla móvil
- **THEN** los filtros y la paginación permanecen accesibles y la tabla puede desplazarse dentro de su contenedor sin ampliar el documento completo
