## 1. Modelo y persistencia

- [x] 1.1 Agregar `member_resigned` a `Assignment` como booleano no nulo con default `false`; verificar el mapeo y la compatibilidad con asignaciones existentes.
- [x] 1.2 Crear la migración Alembic para agregar y backfillear `member_resigned` en PostgreSQL/Supabase; verificar que aplique correctamente y que los registros previos queden en `false`.

## 2. Backend y contrato de API

- [x] 2.1 Extender los esquemas de creación, actualización y respuesta con `member_resigned`, usando `false` por defecto en alta y preservando el valor en actualizaciones parciales; verificar validaciones con pytest.
- [x] 2.2 Extender `GET /api/v1/assignments` con el filtro opcional `member_resigned`; verificar resultados para `true`, `false`, ausencia del filtro y combinación con búsqueda, proveedor, rol, Squad y fechas.
- [x] 2.3 Mantener la autorización `Chapter Lead` y la lógica de capacidad sin cambios; verificar que marcar la renuncia no elimine el consumo hasta `end_date` y que actualizar la fecha fin libere capacidad desde el día siguiente.
- [x] 2.4 Verificar con pytest que una asignación marcada y una asignación de reemplazo puedan coexistir como registros independientes, conservando sus miembros, proveedores, fechas y porcentajes.

## 3. Frontend

- [x] 3.1 Actualizar tipos TypeScript y funciones de API para transportar `member_resigned` en listado, alta, edición y filtro; verificar typecheck.
- [x] 3.2 Agregar al modal el control `Miembro renunció`, con valor por defecto apagado y edición del valor persistido; verificar que no modifique automáticamente la fecha fin.
- [x] 3.3 Agregar el filtro `Todas`/`Miembro renunció`/`Miembro activo en la asignación`, conservarlo al cambiar entre tabla y cards y combinarlo con los filtros existentes.
- [x] 3.4 Mostrar una etiqueta visual `Miembro renunció` en la tabla y en las cards sin reintroducir los nombres de Squad dentro del contenido de las cards.

## 4. Verificación integrada

- [x] 4.1 Agregar pruebas backend para default, persistencia, edición, actualización parcial, filtro, autorización y capacidad con fecha fin inclusiva.
- [x] 4.2 Agregar pruebas Playwright para marcar/desmarcar, visualizar el badge en tabla/cards, filtrar y conservar el filtro al cambiar de vista.
- [x] 4.3 Ejecutar migración contra Supabase, build/typecheck del frontend y suite relevante de backend/Playwright; documentar el resultado y los pasos de despliegue.
