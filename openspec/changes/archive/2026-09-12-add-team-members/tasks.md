## 1. Modelo de datos y migraciones

- [x] 1.1 Crear la entidad de miembros con UUID, datos personales, contacto, fecha de nacimiento, tipo de vínculo, rol profesional, seniority, estado y timestamps; verificar el mapeo con pruebas de persistencia.
- [x] 1.2 Crear o integrar el catálogo de roles profesionales activos y sus consultas; verificar que el endpoint de catálogo no devuelva roles inactivos.
- [x] 1.3 Crear la tabla de afiliaciones miembro-proveedor con rangos de vigencia y relación con proveedores; verificar que un registro tercerizado cree una afiliación inicial y uno de planilla no cree ninguna.
- [x] 1.4 Agregar restricciones e índices para DNI y correo únicos, además de las relaciones necesarias; verificar que la migración se aplique y revierta en una base de prueba sin pérdida de datos.

## 2. Backend

- [x] 2.1 Implementar los esquemas de entrada y salida del registro en `apps/api`, incluyendo los enums de tipo de vínculo y seniority; verificar validaciones de tipos y errores estructurados con pytest.
- [x] 2.2 Implementar `POST /api/v1/members` con transacción atómica para miembro y afiliación inicial; verificar respuesta exitosa y rollback ante fallo de persistencia.
- [x] 2.3 Implementar la carga de proveedores activos y roles profesionales activos para los selectores; verificar respuestas vacías, valores inactivos y proveedores inexistentes.
- [x] 2.4 Aplicar autorización exclusivamente para `Chapter Lead` en el backend; verificar que `Focal Proveedor`, `Miembro de Equipo` y usuarios no autenticados reciban rechazo sin modificar datos.
- [x] 2.5 Implementar normalización y validaciones de DNI, nombres, correo, fecha no futura, campos obligatorios y proveedor condicional; verificar casos válidos, inválidos y duplicados con pytest.

## 3. Frontend responsive

- [x] 3.1 Crear la ruta de registro en `apps/web` y su composición de secciones `Datos personales`, `Contacto` y `Vínculo y perfil`; verificar que la página aplique los componentes y tokens de `docs/design-system.md`.
- [x] 3.2 Construir el formulario con React Hook Form y Zod, incluyendo los campos solicitados, `Tipo de vínculo`, `Rol profesional` y `Seniority`; verificar mensajes de validación junto a cada campo.
- [x] 3.3 Implementar el comportamiento condicional del proveedor para `Planilla` y `Tercerizado`; verificar limpieza, deshabilitación y obligatoriedad según la selección.
- [x] 3.4 Integrar los catálogos y el envío a la API con estados de carga, éxito y error; verificar que un error conserve los valores ingresados y evite envíos duplicados.
- [x] 3.5 Implementar control de acceso y estados de carga/no autorizado en la página; verificar que solo un Chapter Lead pueda completar el flujo.
- [x] 3.6 Verificar responsive, navegación por teclado, foco visible, etiquetas asociadas y ausencia de desplazamiento horizontal en viewport móvil mediante Playwright.

## 4. Verificación integrada

- [x] 4.1 Ejecutar pruebas backend, lint y type checking del frontend; verificar que pytest, Ruff, mypy, ESLint y TypeScript strict finalicen correctamente.
- [x] 4.2 Ejecutar una prueba end-to-end del CRUD de un miembro de planilla y otro tercerizado; verificar persistencia, edición, desactivación, reactivación, afiliación inicial, confirmación visual y rechazo de duplicados.
- [x] 4.3 Documentar el contrato del endpoint, variables de entorno necesarias y pasos de ejecución local; verificar que otro desarrollador pueda levantar el flujo usando la documentación del repositorio.

## 5. Backend del CRUD

- [x] 5.1 Extender los esquemas de `apps/api` para listado, detalle, edición y cambios de estado; verificar que las respuestas incluyan estado, proveedor vigente e historial de afiliaciones sin datos de autenticación.
- [x] 5.2 Implementar `GET /api/v1/members` con filtro `status=active|inactive|all` y `GET /api/v1/members/{id}`; verificar que el listado predeterminado solo incluya activos y que el detalle permita consultar inactivos.
- [x] 5.3 Implementar `PATCH /api/v1/members/{id}` para actualizar datos y reactivar miembros; verificar las mismas validaciones, normalización, unicidad y reglas condicionales del alta.
- [x] 5.4 Implementar el cambio histórico de proveedor dentro de una transacción; verificar que se cierre la afiliación vigente, se cree la nueva afiliación y no se modifiquen relaciones históricas anteriores.
- [x] 5.5 Implementar `DELETE /api/v1/members/{id}` como desactivación lógica; verificar que conserve el registro, impida nuevas asignaciones y que la reactivación conserve el mismo UUID.
- [x] 5.6 Aplicar autorización `Chapter Lead` y manejo consistente de errores en todos los endpoints del CRUD; verificar que usuarios no autorizados no puedan consultar ni modificar miembros.

## 6. Frontend de administración

- [x] 6.1 Crear el listado responsive de miembros con filtro por estado, estado vacío, carga y error; verificar que los activos se muestren por defecto y que los inactivos puedan consultarse.
- [x] 6.2 Implementar la vista de detalle con todos los datos vigentes, acciones disponibles según el estado e historial de proveedores; verificar la presentación correcta de miembros de planilla y tercerizados.
- [x] 6.3 Reutilizar el formulario existente para alta y edición; verificar carga de datos, validaciones, actualización exitosa, manejo de duplicados y conservación de valores ante error.
- [x] 6.4 Implementar confirmación y ejecución de desactivación/reactivación; verificar mensajes de éxito o error, actualización del listado y prevención de acciones duplicadas.
- [x] 6.5 Verificar responsive, navegación por teclado, foco visible, etiquetas asociadas y ausencia de desplazamiento horizontal en listado, detalle y formulario mediante Playwright.

## 7. Verificación integrada del CRUD

- [x] 7.1 Agregar pruebas backend para consulta, edición, cambios de proveedor, unicidad durante edición, desactivación y reactivación; verificar que no exista borrado físico.
- [x] 7.2 Ejecutar una prueba end-to-end completa: crear, consultar, editar, cambiar proveedor, desactivar, consultar como inactivo y reactivar; verificar el historial y la persistencia en Supabase.
- [x] 7.3 Verificar que los catálogos y flujos de asignación no ofrezcan miembros inactivos; documentar el comportamiento de eliminación como desactivación.
