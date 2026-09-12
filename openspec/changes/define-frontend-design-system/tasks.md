## 1. Fundaciones visuales

- [ ] 1.1 Crear los tokens CSS para colores de marca, superficies, texto, bordes y estados semánticos definidos en `docs/design-system.md`, y verificar que puedan consumirse desde cualquier componente frontend
- [ ] 1.2 Configurar tipografía, escala de espaciado, radios, alturas y sombras globales, y verificar su uso en una página de prueba responsive
- [ ] 1.3 Configurar los derivados de color accesibles para texto, botones y estados de foco, y verificar el contraste de los casos de uso principales
- [ ] 1.4 Documentar en la guía las decisiones finales de tokens que difieran de los valores preliminares, y verificar que no existan tokens duplicados para el mismo propósito

## 2. Componentes de formularios

- [ ] 2.1 Crear el componente reutilizable de campo con label, indicador de requerido, ayuda, error y asociación accesible, y verificar sus estados con pruebas de componente
- [ ] 2.2 Crear variantes reutilizables para input, select, date picker, porcentaje, textarea y campos read-only, y verificar apariencia y comportamiento consistente
- [ ] 2.3 Implementar estados default, hover, focus, error, disabled, read-only, loading y success en los controles aplicables, y verificar cada estado en una galería o página de componentes
- [ ] 2.4 Crear componentes para secciones de formulario, resumen de cambios, mensajes de validación y acciones del formulario, y verificar su composición en un formulario de ejemplo
- [ ] 2.5 Implementar botones primarios, secundarios y críticos con estados hover, active, disabled y loading, y verificar que las acciones críticas requieran confirmación cuando corresponda

## 3. Componentes comunes de página

- [ ] 3.1 Crear patrones reutilizables para encabezado, navegación, breadcrumbs, tarjetas, alertas, notificaciones y estados vacíos, y verificar que compartan los tokens definidos
- [ ] 3.2 Crear patrones de carga, error, acceso restringido y cambios sin guardar, y verificar que cada estado tenga una presentación legible y una acción de recuperación cuando aplique
- [ ] 3.3 Crear una representación responsive de tablas mediante tarjetas o secciones apiladas, y verificar la consulta de datos sin desplazamiento horizontal de toda la página en móvil

## 4. Responsive y accesibilidad

- [ ] 4.1 Implementar los breakpoints mobile-first para formularios, acciones y layouts de página, y verificar los estados en móvil, tablet y escritorio
- [ ] 4.2 Verificar navegación completa por teclado, orden lógico de foco, foco visible y nombres accesibles de iconos y controles, y verificarlo con pruebas automatizadas de accesibilidad
- [ ] 4.3 Asociar mensajes de error, ayuda y estados dinámicos con los controles correspondientes, y verificar su anuncio mediante atributos semánticos y pruebas de usuario
- [ ] 4.4 Verificar que ningún estado funcional dependa exclusivamente del color y que los contrastes principales cumplan el estándar de accesibilidad acordado

## 5. Integración y gobernanza

- [ ] 5.1 Integrar la guía `docs/design-system.md` con el catálogo de componentes del frontend, y verificar que cada componente documentado tenga una referencia implementable
- [ ] 5.2 Crear una plantilla para que cada nueva spec de módulo declare componentes reutilizados y excepciones del design system, y verificarla con un cambio OpenSpec de ejemplo
- [ ] 5.3 Añadir una prueba visual o de snapshots para los componentes críticos de formularios, y verificar que cambios accidentales de tokens o estados sean detectables
- [ ] 5.4 Ejecutar lint, type checking, pruebas y build del frontend, y verificar que todos completen correctamente antes de integrar el design system
