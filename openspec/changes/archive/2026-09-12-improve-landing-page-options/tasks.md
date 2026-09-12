## 1. Composición del landing

- [x] 1.1 Definir la colección tipada de los cinco accesos con etiqueta, descripción, ruta e icono, verificando que conserve `/members`, `/providers`, `/squads`, `/assignments` y `/metrics`.
- [x] 1.2 Reemplazar los botones actuales por accesos visuales uniformes, verificando que cada módulo muestre icono, etiqueta y descripción dentro de un enlace funcional.
- [x] 1.3 Implementar los cinco SVG inline con `currentColor` y `aria-hidden`, verificando que no se añada una dependencia externa de iconos.

## 2. Estilo responsive y accesible

- [x] 2.1 Aplicar tokens del design system, espaciado, radios, bordes, contraste y estados hover/focus/active consistentes, verificando la apariencia con inspección visual.
- [x] 2.2 Ajustar la cuadrícula a una columna en móvil y a varias columnas en pantallas amplias, verificando que no exista scroll horizontal en un viewport móvil.
- [x] 2.3 Verificar navegación por teclado, orden de tabulación, foco visible y nombres accesibles mediante Playwright o inspección automatizada.

## 3. Pruebas y calidad

- [x] 3.1 Crear una prueba E2E del landing que valide los cinco accesos, sus destinos y el orden mostrado, verificando que el escenario pase con Playwright.
- [x] 3.2 Añadir una comprobación E2E responsive y de accesibilidad básica, verificando foco visible y ausencia de overflow horizontal en móvil.
- [x] 3.3 Ejecutar `npm run typecheck`, `npm run lint` y `npm run build` en `apps/web`, verificando que todas las validaciones finalicen correctamente.
