## Why

La vista de cards del módulo de asignaciones muestra actualmente información operativa que el usuario no necesita para una lectura rápida y concentra demasiado texto y acciones. Una presentación más enfocada permitirá identificar rápidamente a la persona, su rol, proveedor, proyecto y capacidad asignada.

## What Changes

- Reducir el contenido visible de cada card a nombre completo, rol, empresa proveedora, proyecto, `Squad Ejecutor` y capacidad asignada.
- Mantener los selectores de perspectiva `Squad Asignado` y `Squad Ejecutor` como contexto de agrupación; `Squad Asignado` no se repetirá dentro de cada card y `Squad Ejecutor` sí se mostrará como dato de la asignación.
- Rediseñar las cards con una jerarquía visual más clara, mejor espaciado, superficies y énfasis para la capacidad.
- Reemplazar los textos `Editar` y `Eliminar` por botones de icono con nombres accesibles, tooltip y estados de foco visibles.
- Conservar la confirmación antes de eliminar y el comportamiento actual de edición, desactivación y filtros.

## Capabilities

### New Capabilities

- `assignment-card-view`: presentación resumida, visual y accesible de las asignaciones en cards.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** actualización del componente de cards y sus acciones; no se modifican el contrato de API ni la vista tabla.
- **Iconografía:** se utilizarán iconos SVG inline accesibles, sin agregar una dependencia externa al proyecto.
- **Accesibilidad:** los botones de icono tendrán `aria-label`, tooltip mediante `title`, foco visible y no dependerán únicamente del icono para comunicar su función.
- **Responsive:** las cards conservarán el comportamiento mobile-first y deberán evitar overflow horizontal.
- **Pruebas:** actualizar pruebas Playwright para validar únicamente los campos permitidos, acciones por icono, confirmación de eliminación y viewport móvil.
