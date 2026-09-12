## 1. Modelo de datos y migración

- [x] 1.1 Crear la entidad `Squad` con UUID, código, nombre, tribu, PO, estado y timestamps; verificar el mapeo mediante una prueba de persistencia.
- [x] 1.2 Agregar la migración Alembic para crear `squads`, incluyendo columnas obligatorias, valores nulos para tribu/PO e índice único insensible a mayúsculas para el código; verificar que aplique y revierta sin afectar otras tablas.

## 2. Backend y API

- [x] 2.1 Crear esquemas de entrada, actualización y respuesta para Squads; verificar obligatoriedad de código/nombre, normalización de textos y validación alfanumérica del código con pytest.
- [x] 2.2 Implementar `POST /api/v1/squads` para crear un Squad activo; verificar persistencia, normalización del código y respuesta de creación exitosa.
- [x] 2.3 Implementar `GET /api/v1/squads` con filtro `status=active|inactive|all` y `GET /api/v1/squads/{id}`; verificar que el listado predeterminado muestre activos y el detalle incluya inactivos.
- [x] 2.4 Implementar `PATCH /api/v1/squads/{id}` para editar datos y reactivar con `is_active: true`; verificar validaciones, unicidad, conservación del UUID y rechazo de códigos duplicados.
- [x] 2.5 Implementar `DELETE /api/v1/squads/{id}` como desactivación lógica; verificar que conserve el registro, lo excluya del listado activo y devuelva 404 para identificadores inexistentes.
- [x] 2.6 Proteger todas las operaciones administrativas con `Chapter Lead` y traducir conflictos de código a errores estables; verificar que usuarios no autorizados no puedan consultar ni modificar Squads.

## 3. Frontend responsive

- [x] 3.1 Agregar tipos y funciones de API para listado, detalle, creación, edición, desactivación y reactivación; verificar TypeScript strict y manejo de errores HTTP.
- [x] 3.2 Crear la página `/squads` con listado, filtros por estado, estados de carga/error/vacío y acceso a las acciones; verificar que los activos se consulten por defecto.
- [x] 3.3 Crear el formulario reutilizable de alta y edición con código, nombre, tribu y PO; verificar labels, obligatoriedad, validación alfanumérica y preservación de valores ante error.
- [x] 3.4 Crear las páginas `/squads/new`, `/squads/[id]` y `/squads/[id]/edit`; verificar detalle de registros activos e inactivos y navegación entre listado, detalle y edición.
- [x] 3.5 Implementar confirmación y ejecución de desactivación/reactivación; verificar actualización del estado, bloqueo de envíos duplicados y mensajes de éxito/error.
- [x] 3.6 Aplicar el sistema visual y accesibilidad responsive del proyecto; verificar con Playwright navegación por teclado, foco visible, labels asociadas y ausencia de overflow horizontal en móvil.

## 4. Verificación integrada y documentación

- [x] 4.1 Agregar pruebas backend para creación, normalización, campos obligatorios, código inválido, duplicidad, filtros, edición, desactivación y reactivación; verificar que la suite pytest pase.
- [x] 4.2 Ejecutar una prueba end-to-end del ciclo completo de un Squad; verificar creación, consulta, edición, desactivación, consulta como inactivo y reactivación.
- [x] 4.3 Documentar el contrato de `/api/v1/squads`, variables de entorno y pasos locales; verificar lint, mypy, TypeScript strict, build y que otro desarrollador pueda ejecutar el módulo.
