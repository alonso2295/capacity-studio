## Context

La vista `AssignmentsCards` agrupa las asignaciones por squad y actualmente reutiliza un resumen con datos que son útiles en la tabla, pero excesivos para una lectura rápida en cards. Las acciones también se muestran como enlaces de texto. El proyecto no cuenta con una dependencia de iconos, por lo que el cambio debe apoyarse en el sistema visual existente sin ampliar innecesariamente el bundle.

## Goals

- Reducir cada card a nombre completo, rol, proveedor, proyecto, Squad Ejecutor y capacidad asignada.
- Crear una jerarquía visual clara que permita escanear rápidamente la información.
- Hacer que editar y eliminar sean acciones compactas, reconocibles y accesibles.
- Mantener intactos la agrupación por perspectiva, los filtros y los flujos de edición y eliminación.
- Conservar el comportamiento responsive mobile-first definido por el sistema de diseño.

## Non-goals

- No modificar el contrato de la API ni el modelo de asignaciones.
- No cambiar la vista tabla ni sus acciones textuales.
- No cambiar la lógica de filtros, paginación, ordenamiento o confirmación de eliminación.
- No agregar información nueva a las cards.

## Decisions

### Jerarquía de contenido

Cada `article` de asignación tendrá tres zonas visuales:

1. Encabezado con el nombre completo como texto principal.
2. Metadatos secundarios con rol y empresa proveedora; cuando no exista proveedor se mostrará `Planilla`.
3. Fila inferior con el código de proyecto, el Squad Ejecutor y la capacidad asignada, dando mayor énfasis visual al porcentaje.

El DNI, seniority, fechas, estado de renuncia y Squad Asignado se excluirán del contenido de la card. El Squad Ejecutor sí se mostrará como dato persistido de la asignación. El nombre del Squad Asignado seguirá visible únicamente en los encabezados de agrupación y las pestañas de perspectiva, porque es contexto de navegación de la vista y no un dato repetido de cada perfil.

### Composición visual

Se conservarán las superficies y tokens del sistema de diseño: borde de 1px, radio de card, sombra sutil, fondo claro y espaciado de 16px en móvil / 20–24px en escritorio. El nombre ocupará la primera línea con una tipografía más destacada; los valores largos podrán envolver el texto. La capacidad usará una etiqueta o bloque visual con texto explícito, de modo que el significado no dependa solamente del color.

El contenedor de cards continuará usando una columna en móvil y dos columnas en pantallas grandes. La card no usará interacciones que dependan exclusivamente de hover.

### Acciones con iconos

Las acciones de card se mostrarán como botones compactos con iconos SVG inline de lápiz y papelera. No se agregará una librería de iconos. Cada botón tendrá:

- `aria-label` explícito (`Editar asignación` o `Eliminar asignación`).
- `title` como tooltip nativo.
- foco visible y tamaño mínimo compatible con interacción táctil.
- estados hover, focus y disabled coherentes con los tokens existentes.

Las acciones se implementarán como una variante específica de cards para no alterar los botones textuales de la tabla. Editar conservará el flujo actual y eliminar conservará la confirmación existente antes de desactivar/eliminar.

### Compatibilidad con perspectiva y filtros

La transformación se limitará a la presentación de cada asignación. Se mantendrán `Squad Asignado` y `Squad Ejecutor` como pestañas, los encabezados de grupo y la fuente de datos ya filtrada. Al cambiar de perspectiva cambiarán los grupos y sus encabezados, pero el campo Squad Ejecutor continuará visible dentro de cada card junto con los otros cinco campos.

## Accessibility

- Los botones de icono tendrán nombres accesibles y tooltip.
- El orden de foco seguirá el orden visual de la card.
- Todos los controles conservarán un indicador de foco visible.
- El contenido podrá leerse y operarse con teclado y lector de pantalla.
- Los cambios de estado no se comunicarán únicamente por color.
- Se probarán viewports móvil y escritorio para evitar overflow horizontal.

## Testing strategy

- Actualizar las pruebas Playwright de cards para verificar que se muestran exactamente los seis datos permitidos, incluido Squad Ejecutor, y que no aparecen DNI, seniority, fechas, estado de renuncia ni Squad Asignado dentro de la card.
- Verificar que el proveedor nulo se presenta como `Planilla`.
- Verificar que los botones de icono exponen sus nombres accesibles, abren edición y disparan la confirmación de eliminación.
- Mantener pruebas de cambio de perspectiva, filtros y agrupación.
- Ejecutar validación responsive en viewport móvil y escritorio.

## Risks and mitigations

- **Iconos menos evidentes que el texto:** se mitiga con `aria-label`, `title`, foco visible y una ubicación consistente.
- **Nombres o proyectos extensos:** se mitiga permitiendo wrapping y evitando anchos rígidos.
- **Pérdida de contexto de renuncia en cards:** se acepta porque la solicitud prioriza una card minimalista; la información completa permanece disponible en la tabla y en el flujo de edición.
