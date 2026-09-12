## 1. Backend y contrato paginado

- [x] 1.1 Crear esquemas para parámetros y respuesta paginada de asignaciones, incluyendo `items`, `total`, `page`, `page_size` y `total_pages`; verificar validación de página, tamaño, columna y dirección.
- [x] 1.2 Extender `GET /api/v1/assignments` para aplicar filtros, ordenamiento seguro con desempate estable y paginación en PostgreSQL antes de serializar los registros; verificar que la respuesta conserve la autorización `Chapter Lead`.
- [x] 1.3 Cubrir con pytest filtros inclusivos, total de resultados, límites de página, orden ascendente/descendente por columnas simples y relacionadas, desempate y parámetros inválidos.

## 2. Frontend de tabla y filtros

- [x] 2.1 Actualizar tipos TypeScript y API client para el contrato paginado, parámetros de página/tamaño/orden y compatibilidad con el modo cards; verificar `npm run typecheck`.
- [x] 2.2 Inicializar vacíos los filtros de fechas, restaurarlos vacíos desde `Limpiar filtros` y manejar en la clave de TanStack Query filtros, página, tamaño y orden; verificar fechas inclusivas y reinicio a la primera página.
- [x] 2.3 Convertir los encabezados de datos de la tabla en controles ordenables con dirección visible, `aria-sort` y etiquetas accesibles; verificar que el clic alterna ascendente/descendente y conserva filtros.
- [x] 2.4 Implementar controles de paginación y tamaño de página con estados de primera/última página, total de resultados, carga, error y vacío; verificar que no exista overflow horizontal adicional en móvil.
- [x] 2.5 Mantener la vista cards con los filtros actuales sin controles de paginación de tabla, solicitando el tamaño máximo documentado; verificar el cambio tabla/cards sin perder filtros.

## 3. Verificación integrada

- [x] 3.1 Agregar pruebas Playwright para las fechas vacías al abrir, limpiar filtros, filtros inclusivos y actualización de la primera página.
- [x] 3.2 Agregar pruebas Playwright para ordenar columnas, invertir dirección, navegar páginas, cambiar tamaño, mantener filtros, cambiar a cards y viewport móvil.
- [x] 3.3 Ejecutar Ruff, mypy, pytest, typecheck, build y E2E relevante; verificar el endpoint paginado con PostgreSQL/Supabase y documentar resultados.
