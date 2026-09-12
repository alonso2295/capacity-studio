## Context

El frontend de Capacity Studio todavía no tiene una implementación de UI. La
identidad visual solicitada se inspira en Pacífico Seguros y debe servir para
formularios y páginas internas de gestión. La guía detallada vivirá en
`docs/design-system.md`; esta decisión se conserva como cambio OpenSpec para
que futuras páginas puedan referenciarla y validarla.

## Goals / Non-Goals

**Goals:**

- Crear una fuente de verdad visual y de interacción para el frontend.
- Estandarizar formularios y sus estados antes de implementar módulos.
- Definir un lenguaje visual accesible, responsive, humano y profesional.
- Permitir que futuros módulos reutilicen los mismos tokens y patrones.
- Mantener separadas las reglas globales de diseño de las reglas de negocio de
  cada módulo.

**Non-Goals:**

- Implementar todavía páginas funcionales de miembros, proveedores, Squads o
  asignaciones.
- Fijar el layout completo de una página de negocio específica.
- Crear una aplicación móvil nativa.
- Sustituir las reglas funcionales de las specs de cada módulo.

## Decisions

### Fuente de verdad

- `docs/design-system.md` será la guía detallada para diseñadores y desarrolladores.
- `specs/design-system/spec.md` será el contrato de comportamiento visual y de
  interacción verificable.
- `openspec/config.yaml` mantendrá únicamente la regla resumida que obliga a
  consultar el design system.
- Las specs de módulos referenciarán el design system y solo describirán sus
  excepciones cuando sean necesarias.

### Identidad visual

- El cian de marca `#0099CC` será el color de identidad principal.
- Para texto pequeño sobre fondos claros o botones con texto blanco se usarán
  tokens derivados con contraste accesible; el cian de marca se reservará para
  acentos, enlaces, indicadores y acciones donde el contraste lo permita.
- El magenta `#EE2C70` será un color auxiliar para énfasis y estados destacados,
  no el color predeterminado de errores destructivos.
- Fondos claros, azul oscuro para texto y una escala de grises formarán la base
  de la interfaz.

### Formularios

- Los formularios usarán una estructura consistente de label, control, ayuda y
  error.
- El layout será mobile-first: una columna en móvil y una grilla de hasta dos
  columnas en pantallas amplias cuando la relación entre campos lo permita.
- Los campos tendrán estados explícitos para default, hover, focus, error,
  disabled, read-only, loading y success.
- Las acciones primarias, secundarias y críticas tendrán jerarquía visual clara.
- Las acciones críticas requerirán confirmación cuando no sean reversibles.

### Accesibilidad

- Las etiquetas visibles y el foco de teclado serán obligatorios.
- Los mensajes de error estarán asociados al control correspondiente y no
  dependerán solo del color.
- Los controles táctiles tendrán un área cómoda y los iconos solos incluirán
  nombre accesible o tooltip apropiado.
- El contraste se verificará para texto, controles, estados y elementos de foco.

### Reutilización

- La futura implementación creará componentes de formulario compartidos en la
  capa UI, en lugar de estilos ad hoc por página.
- Las decisiones visuales se expresarán como tokens para facilitar ajustes de
  marca sin reescribir cada pantalla.

## Risks / Trade-offs

- [El color exacto de marca puede no cumplir contraste AA en todos los usos] ->
  conservar el color de marca como token y usar derivados accesibles en texto,
  botones y controles pequeños.
- [Un sistema demasiado rígido puede impedir necesidades de negocio] -> permitir
  excepciones documentadas por módulo, sin crear variantes visuales innecesarias.
- [La guía puede separarse de la implementación] -> añadir pruebas visuales y
  componentes compartidos cuando se construya la capa UI.
- [Las tablas de gestión pueden ser difíciles de usar en móvil] -> definir desde
  el inicio una representación alternativa en tarjetas o secciones apiladas.

## Migration Plan

1. Revisar y aprobar `docs/design-system.md` como referencia visual.
2. Implementar tokens globales y componentes base de UI en un cambio posterior.
3. Migrar cada módulo nuevo directamente a los componentes compartidos.
4. Aplicar el design system a módulos existentes si se implementan antes de esta
   fundación.

## Open Questions

Ninguna que bloquee la documentación del sistema. La familia tipográfica final
podrá ajustarse cuando se confirme la disponibilidad de una fuente corporativa.
