## 1. Acciones de la tabla

- [x] 1.1 Reemplazar las etiquetas textuales de editar y eliminar en la tabla por botones de icono reutilizando la iconografía existente; verificar `aria-label`, `title`, foco visible, tamaño táctil y navegación por teclado.
- [x] 1.2 Conservar los callbacks actuales, confirmación de eliminación y estado disabled durante la operación; verificar que editar abra la asignación correcta y eliminar solo se ejecute después de confirmar.

## 2. Presentación del estado de renuncia

- [x] 2.1 Retirar la columna visible y ordenable `Renuncia` de la tabla sin eliminar el filtro ni el campo del formulario; verificar que el encabezado y el control de ordenamiento ya no aparezcan.
- [x] 2.2 Aplicar color magenta al nombre de una asignación renunciada e incluir una marca visualmente oculta `Miembro renunció`; verificar que asignaciones activas conserven el estilo normal y no anuncien ese estado.

## 3. Pruebas y regresión

- [x] 3.1 Actualizar las pruebas Playwright para validar iconos accesibles, ausencia de la columna Renuncia, nombre magenta, estado accesible y filtro de renuncia.
- [x] 3.2 Verificar que paginación, ordenamiento de columnas restantes, edición, eliminación y responsive móvil continúen funcionando ejecutando TypeScript, ESLint y Playwright de asignaciones.
