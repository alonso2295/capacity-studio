## Context

La tabla de asignaciones comparte actualmente `AssignmentActions` con botones textuales de editar y eliminar y renderiza `member_resigned` como una columna propia. La vista de cards ya utiliza acciones con iconos. El cambio debe seguir el sistema visual existente, no modificar API ni persistencia y conservar el filtro de renuncia.

## Goals / Non-Goals

**Goals:**

- Aplicar acciones compactas con iconos a las filas de la tabla.
- Retirar la columna de renuncia sin perder la posibilidad de filtrar o editar ese estado.
- Comunicar una renuncia mediante nombre magenta y una marca accesible no visible.
- Mantener intactos paginación, ordenamiento de las columnas restantes y confirmación de eliminación.

**Non-Goals:**

- No modificar el contrato de API, el modelo de asignaciones ni las reglas de negocio.
- No cambiar la vista de cards ni su diseño ya implementado.
- No eliminar el filtro de renuncia ni el campo de renuncia del formulario de edición.
- No agregar una nueva dependencia de iconografía.

## Decisions

### Acciones de tabla

La tabla usará botones de icono para editar y eliminar, reutilizando los iconos SVG inline y los mismos nombres accesibles establecidos para las cards. Los botones tendrán `aria-label`, `title`, foco visible, estados hover/focus/disabled y un área táctil mínima de 44px. La acción de eliminar conservará la confirmación actual.

La variante de tabla puede compartir los componentes visuales de iconos con cards, pero debe conservar el comportamiento de callbacks existente. No se mostrarán las palabras `Editar` o `Eliminar` como etiquetas visibles en la celda.

### Estado de renuncia en la fila

Se eliminará `member_resigned` del arreglo de columnas visibles y ordenables de la tabla. La celda del miembro aplicará el color magenta de mayor contraste definido por el sistema cuando `member_resigned` sea verdadero. En la misma celda se incluirá un texto visualmente oculto `Miembro renunció` para lectores de pantalla; el nombre seguirá siendo visible y no se agregará un badge o una nueva columna.

El estado se comunicará con color y texto accesible, cumpliendo la regla del sistema de diseño de no depender solamente del color. Los nombres sin renuncia conservarán la clase de texto principal y no incluirán la marca oculta.

### Compatibilidad con tabla y filtros

La eliminación de la columna no cambiará el ordenamiento, filtro, paginación ni contrato de datos. El filtro `Filtrar por renuncia` continuará enviando el mismo criterio. Los encabezados restantes seguirán mostrando sus indicadores y etiquetas accesibles, y la tabla conservará su desplazamiento horizontal interno en pantallas pequeñas.

## Accessibility

- Los botones de icono tendrán nombres accesibles, tooltip y foco visible.
- La ausencia de una columna visible no eliminará la información de renuncia para tecnologías de asistencia.
- El color magenta se combinará con la marca de texto oculto `Miembro renunció`.
- La interacción seguirá disponible mediante teclado.

## Testing strategy

- Verificar que la tabla no renderice la columna ni el encabezado `Renuncia`.
- Verificar que una fila renunciada muestre el nombre con el estilo magenta y el texto accesible, y que una fila activa no lo haga.
- Verificar nombres accesibles, tooltip y foco de los botones de editar y eliminar.
- Verificar edición, confirmación de eliminación, filtro de renuncia, paginación y ordenamiento de columnas restantes.
- Ejecutar TypeScript, ESLint y Playwright de asignaciones en viewport móvil.

## Risks / Trade-offs

- **Iconos menos explícitos que el texto:** se mitiga con `aria-label`, `title`, foco visible y un diseño consistente con las cards.
- **Renuncia menos evidente para personas que no distinguen colores:** se mitiga con la marca accesible y el filtro existente; no se agrega texto visible para conservar la tabla compacta.
- **Cambio en el número de columnas:** se mitiga manteniendo el scroll horizontal interno y actualizando las pruebas de encabezados y acciones.
