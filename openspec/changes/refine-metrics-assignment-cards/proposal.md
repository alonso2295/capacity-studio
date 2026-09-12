## Why

La sección `Asignaciones del trimestre` todavía ocupa más espacio vertical del
necesario porque muestra rótulos repetidos para Rol, Proveedor y Proyecto. Esto
dificulta comparar rápidamente los miembros de un mismo squad y, además, el
orden actual no prioriza la lectura por perfil profesional.

## What Changes

- Simplificar la composición de cada card para ocultar los rótulos visibles
  `Rol`, `Proveedor` y `Proyecto`, conservando y mostrando sus valores.
- Mantener visibles los valores de rol, proveedor y proyecto junto con el resto
  de la información operativa ya definida para la card.
- Ordenar los miembros dentro de cada grupo primero por nombre de rol
  profesional en orden ascendente y luego por nombre de proveedor en orden
  ascendente; usar nombre del miembro e identificador como desempates estables.
- Conservar las perspectivas de Squad Asignado y Squad Ejecutor, filtros,
  exclusión de renuncias, estados accesibles y comportamiento responsive.
- Agregar cobertura E2E y, si corresponde al punto de ordenamiento de datos,
  API para comprobar que arquitectos aparecen antes que ingenieros y que los
  proveedores se ordenan dentro de cada rol.

## Capabilities

### New Capabilities

<!-- No se introduce una capacidad nueva; se ajusta una capacidad existente. -->

### Modified Capabilities

- `metrics-assignment-cards`: cambia la presentación compacta de los valores de
  las cards y agrega un orden visible y determinista por rol y proveedor.

## Impact

- Frontend: `apps/web/components/metrics-dashboard.tsx` y las pruebas E2E de
  métricas; se ajustan el markup visual y el orden de las cards.
- Backend/contrato: se revisará el orden de la respuesta de
  `GET /api/v1/metrics/dashboard` solo si es necesario para garantizar un
  orden estable compartido; no se requieren cambios de base de datos.
- No se agregan dependencias, filtros, acciones ni campos nuevos.
