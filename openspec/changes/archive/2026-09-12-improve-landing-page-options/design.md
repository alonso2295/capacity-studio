## Context

La ruta raíz se implementa en `apps/web/app/page.tsx` como un bloque estático de enlaces con estilos alternados. El frontend usa Next.js App Router, TypeScript, Tailwind CSS y los tokens documentados en `docs/design-system.md`; no existe una biblioteca de iconos instalada ni una capability de landing en `openspec/specs`.

## Goals / Non-Goals

**Goals:**

- Crear una composición reutilizable para los cinco accesos del landing.
- Dar a cada módulo un icono SVG inline, consistente en tamaño, trazo y tratamiento visual.
- Mantener navegación, idioma español, contraste, foco visible y comportamiento mobile-first.
- Añadir cobertura E2E para rutas, accesibilidad básica y ausencia de overflow horizontal.

**Non-Goals:**

- Cambiar rutas, permisos, autenticación o comportamiento de los módulos.
- Añadir dependencias externas de iconos.
- Rediseñar el layout interno de las páginas enlazadas.

## Decisions

- **Modelo de datos local:** definir los cinco accesos en una colección tipada con etiqueta, descripción, ruta e icono. Esto evita markup duplicado y mantiene la configuración de navegación en un único lugar.
- **Componente de acceso:** renderizar cada elemento como un único `Link` con estructura consistente de icono, texto y affordance visual. Se conserva el enlace nativo para navegación y teclado.
- **Iconografía:** usar SVG inline con `aria-hidden="true"`, `currentColor` y una caja de tamaño fijo. Así se evita una nueva dependencia y el icono hereda el estado cromático del acceso.
- **Layout responsive:** usar una cuadrícula de una columna en móvil y ampliar a dos o más columnas solo cuando el ancho lo permita. El contenedor conservará el fondo `canvas`, tarjetas `surface`, borde `border`, radio `card` y sombra `subtle`.
- **Validación:** crear una prueba Playwright para verificar los cinco nombres/rutas, el orden de tabulación y el viewport móvil; ejecutar también `typecheck`, `lint` y build.

## Risks / Trade-offs

- [Iconos ambiguos] → combinar siempre icono con etiqueta y descripción textual.
- [Diferencias de tamaño entre descripciones] → usar una estructura flexible y alinear la acción visual sin truncar contenido.
- [Cambios futuros de módulos] → mantener la colección de accesos separada del JSX para facilitar altas o bajas controladas.

## Migration Plan

Reemplazar el markup actual del landing, ejecutar las validaciones del frontend y desplegar como cambio visual compatible. El rollback consiste en restaurar `apps/web/app/page.tsx` al markup anterior; no hay migraciones ni cambios de datos.
