## 1. Modelo de datos y migración

- [x] 1.1 Ampliar `Vendor` con razón social, RUC, focal point, celular opcional, estado y timestamps, manteniendo sus relaciones existentes; verificar el mapeo con pruebas de persistencia.
- [x] 1.2 Crear la migración Alembic para agregar las columnas nuevas, resolver filas existentes antes de imponer campos obligatorios y crear la unicidad normalizada del RUC; verificar upgrade y downgrade sobre una base de prueba.
- [x] 1.3 Verificar que las afiliaciones históricas sigan referenciando proveedores desactivados y que el catálogo existente continúe devolviendo solo proveedores activos.

## 2. Backend y contrato REST

- [x] 2.1 Implementar esquemas de entrada, actualización, detalle y listado con normalización del RUC, campos obligatorios y celular opcional; verificar validaciones de valores vacíos, caracteres no alfanuméricos y espacios.
- [x] 2.2 Implementar `GET /api/v1/providers` con filtro por estado y `GET /api/v1/providers/{id}`; verificar que el listado administrativo incluya ambos estados y que el detalle encuentre proveedores inactivos.
- [x] 2.3 Implementar `POST /api/v1/providers` para crear proveedores activos; verificar persistencia, normalización, respuesta y rechazo de RUC duplicado.
- [x] 2.4 Implementar `PATCH /api/v1/providers/{id}` para editar datos y estado; verificar actualización atómica, rechazo de RUC duplicado y conservación de datos ante error.
- [x] 2.5 Implementar `DELETE /api/v1/providers/{id}` como desactivación lógica y permitir reactivar mediante actualización de estado; verificar que no se eliminen filas ni afiliaciones históricas.
- [x] 2.6 Mantener `/api/v1/catalogs/vendors` limitado a proveedores activos y rechazar asociaciones nuevas con proveedores inactivos; verificar regresión del registro de miembros tercerizados.
- [x] 2.7 Mantener el módulo independiente de cuentas y permisos; verificar que las operaciones CRUD no creen ni modifiquen registros de autenticación.

## 3. Frontend responsive

- [x] 3.1 Agregar tipos, clientes API y manejo de errores para el CRUD de proveedores; verificar que los conflictos del RUC y errores de validación puedan asociarse a sus campos.
- [x] 3.2 Crear la vista de listado con filtro por activo/inactivo, estado visible, detalle y acciones de crear/editar; verificar estados de carga, vacío y error.
- [x] 3.3 Crear el formulario de alta y edición con razón social, RUC, focal point y celular opcional; verificar validación inmediata, normalización y conservación de valores ante error de red.
- [x] 3.4 Implementar confirmación y feedback para desactivar y reactivar proveedores; verificar que la interfaz refleje el estado sin borrar el registro del listado administrativo.
- [ ] 3.5 Aplicar los patrones de `docs/design-system.md`, navegación por teclado, foco visible, etiquetas asociadas y layout de una columna en móvil; verificarlo con Playwright en viewport móvil y escritorio.

## 4. Verificación integrada y documentación

- [x] 4.1 Agregar pruebas backend para creación, lectura, edición, RUC duplicado, filtros, desactivación, reactivación y compatibilidad con miembros; verificar que pytest y las comprobaciones de tipos/lint pasen.
- [ ] 4.2 Agregar pruebas end-to-end del CRUD completo y del rechazo de un proveedor inactivo en una nueva afiliación; verificar confirmaciones visuales y persistencia tras recargar.
- [x] 4.3 Documentar los endpoints, campos, estados, normalización del RUC y pasos de ejecución local; verificar que la documentación coincida con el contrato implementado.
