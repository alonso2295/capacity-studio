## Why

La tabla de asignaciones ocupa espacio con una columna dedicada a la renuncia y utiliza acciones textuales que incrementan el ruido visual. Una presentación más compacta permitirá priorizar los datos operativos, reconocer visualmente a los miembros que renunciaron y mantener editar/eliminar disponibles de forma consistente.

## What Changes

- Reemplazar las acciones textuales `Editar` y `Eliminar` de la tabla por botones de icono accesibles, con tooltip, foco visible y confirmación de eliminación.
- Eliminar la columna visible `Renuncia` de la tabla.
- Mostrar el nombre del team member en color magenta cuando su asignación esté marcada como renuncia.
- Incluir una marca accesible no visible equivalente a `Miembro renunció` para que el estado no dependa únicamente del color.
- Mantener el filtro de renuncia y el indicador de renuncia en el flujo de edición sin modificar el contrato de API.

## Capabilities

### New Capabilities

- `assignment-table-presentation`: presentación compacta y accesible de acciones y estados de renuncia en la tabla de asignaciones.

### Modified Capabilities

Ninguna.

## Impact

- **Frontend:** actualización del componente de tabla y sus acciones; las cards ya cuentan con acciones de icono y conservarán su comportamiento.
- **Accesibilidad:** los botones de icono tendrán `aria-label`, tooltip y foco visible; el nombre magenta de una persona renunciada incluirá texto accesible adicional.
- **API y persistencia:** no se modifican endpoints, filtros, modelo ni datos de Supabase.
- **Pruebas:** actualizar pruebas Playwright para validar iconos, ausencia de la columna Renuncia, nombre magenta, estado accesible y confirmación de eliminación.
