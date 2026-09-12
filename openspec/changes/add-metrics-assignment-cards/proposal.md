## Why

El módulo de métricas actualmente resume la operación con KPIs y visualizaciones,
pero no permite revisar las asignaciones individuales de forma visual ni
compararlas entre el Squad al que fueron asignadas y el Squad que ejecuta el
servicio. Se necesita una vista de cards con filtros operativos para analizar
rápidamente qué perfiles están asignados en cada contexto.

## What Changes

- Agregar al módulo de métricas una sección de asignaciones en formato cards.
- Incorporar filtros por año y trimestre, proveedor y rol profesional.
- Incorporar un selector multiselección de Squad Asignado para mostrar uno o más Squads simultáneamente.
- Mostrar en cada card únicamente nombre completo, rol, proveedor, proyecto, capacidad asignada y Squad Ejecutor, con un diseño compacto y minimalista.
- Permitir alternar la agrupación y visualización entre Squad Asignado y Squad Ejecutor.
- Mantener la intersección inclusiva de fechas del trimestre y excluir de la vista operativa las asignaciones marcadas como miembro renunció, de acuerdo con las métricas existentes.
- Mantener la vista responsive, accesible y consistente con las cards del módulo de gestión de asignaciones, evitando cards sobredimensionadas y espacios visuales innecesarios.

## Capabilities

### New Capabilities

- `metrics-assignment-cards`: consulta filtrable y visualización en cards de las asignaciones trimestrales con perspectivas de Squad Asignado y Squad Ejecutor.

### Modified Capabilities

<!-- No existing main capability specs are present under openspec/specs/. -->

## Impact

- Frontend: sección de asignaciones de `/metrics`, filtros, selector multiselección, agrupación por perspectiva y cards responsive de baja densidad visual.
- Backend: extensión del contrato del dashboard de métricas para aceptar filtros de proveedor, rol y uno o más Squads Asignados, y devolver asignaciones con los datos necesarios para las cards.
- Cliente y tipos: nuevos filtros y payload de asignaciones métricas.
- Persistencia: consultas sobre asignaciones, miembros, proveedores y Squads existentes; no se requieren nuevas tablas ni migraciones.
- Las métricas ejecutivas existentes seguirán calculándose por año/trimestre; los filtros operativos adicionales controlarán la sección de cards de asignaciones.
