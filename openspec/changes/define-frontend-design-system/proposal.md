## Why

Capacity Studio necesita una identidad visual consistente para que los formularios y futuras páginas se sientan parte del mismo producto. Sin una fuente de verdad compartida, cada módulo puede terminar usando colores, espaciados, estados y patrones responsive diferentes.

## What Changes

- Definir un sistema de diseño transversal para el frontend.
- Documentar identidad visual inspirada en Pacífico Seguros.
- Estandarizar formularios, botones, campos, mensajes, estados y acciones.
- Definir comportamiento responsive para escritorio, tablet y móvil.
- Establecer requisitos de accesibilidad para los componentes visuales.
- Crear una guía reutilizable para Product Owners, diseñadores y desarrolladores.
- Preparar la futura implementación mediante tokens y componentes reutilizables.

## Capabilities

### New Capabilities

- `design-system`: Define las reglas visuales y de interacción globales que deben cumplir las páginas y componentes del frontend.

### Modified Capabilities

Ninguna. El sistema de diseño transversal aún no existe.

## Impact

- Se agregará `docs/design-system.md` como guía detallada y fuente de referencia humana.
- Se agregará una spec OpenSpec con reglas verificables para el sistema de diseño.
- Se actualizará el contexto del proyecto para que futuras tareas frontend consulten el design system.
- Los módulos futuros deberán referenciar estas reglas y documentar explícitamente cualquier excepción.
- La implementación visual podrá reutilizar tokens CSS, Tailwind CSS, shadcn/ui y componentes de formulario compartidos.
