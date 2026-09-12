## Why

La página inicial presenta las opciones principales como botones independientes, con estilos alternados y sin una señal visual que ayude a reconocer cada módulo. Una navegación más consistente y escaneable mejorará la orientación de los usuarios sin cambiar las rutas existentes.

## What Changes

- Convertir las cinco opciones principales del landing en un conjunto visual uniforme de tarjetas o accesos.
- Añadir un icono consistente y accesible para Miembros, Proveedores, Squads, Asignaciones y Métricas.
- Mantener etiquetas, destinos y permisos actuales de cada opción.
- Definir estados hover, focus y active coherentes, además de una disposición responsive de una columna en móvil.
- Verificar que los iconos sean decorativos cuando exista texto visible y que cada acceso tenga un nombre accesible.

## Capabilities

### New Capabilities

- `landing-page-navigation`: Presentación consistente, accesible y responsive de los accesos principales del landing.

### Modified Capabilities

<!-- No existing capability covers the landing page navigation. -->

## Impact

- `apps/web/app/page.tsx` y posiblemente componentes reutilizables de navegación visual.
- Pruebas E2E o de interfaz del frontend para validar destinos, nombres accesibles y comportamiento responsive.
- No se requieren cambios en la API, base de datos ni dependencias externas; se reutilizarán los tokens de `docs/design-system.md` y las capacidades existentes de Tailwind CSS.
