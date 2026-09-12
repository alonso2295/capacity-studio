## 1. Modelo de datos y migración

- [x] 1.1 Crear la entidad `Assignment` con miembro, Squad Asignado, Squad Ejecutor, proveedor capturado nullable, código de proyecto, fechas inclusivas, porcentaje decimal y timestamps; verificar el mapeo con una prueba de persistencia y la restricción `end_date >= start_date`.
- [x] 1.2 Agregar la migración Alembic para crear `assignments`, claves foráneas e índices para miembro/fechas, proveedor, rol consultado y Squad; verificar que aplique y revierta en PostgreSQL/Supabase sin modificar tablas existentes.
- [x] 1.3 Definir las relaciones y consultas necesarias para devolver nombre completo, DNI, rol, seniority y nombres de proveedor/Squad; verificar que un proveedor capturado permanezca consultable aunque luego se desactive.
- [x] 1.4 Migrar la referencia actual `squad_id` a `assigned_squad_id`, agregar `executor_squad_id` obligatorio y backfillear los registros existentes con el mismo Squad en ambos campos; verificar la migración y sus restricciones en PostgreSQL/Supabase.

## 2. Backend y reglas de negocio

- [x] 2.1 Crear esquemas de candidato, respuesta enriquecida, creación y actualización; verificar campos obligatorios, código de proyecto con símbolos, porcentaje 0–100, fechas válidas y edición limitada a campos permitidos mediante pytest.
- [x] 2.2 Implementar la consulta de miembros activos candidatos por nombre o DNI, incluyendo proveedor vigente, rol y seniority; verificar coincidencias parciales, búsqueda sin distinción de mayúsculas y ausencia de miembros inactivos.
- [x] 2.3 Implementar el cálculo de capacidad máxima por día para rangos inclusivos, excluyendo la asignación actual en edición; verificar rangos idénticos, parcialmente superpuestos, adyacentes y sin solapamiento con pytest.
- [x] 2.4 Implementar bloqueo transaccional por miembro y validar la suma máxima de 100% antes de crear o editar; verificar que un conflicto devuelva HTTP 409 con información accionable y no persista cambios.
- [x] 2.5 Implementar `GET /api/v1/assignments` con búsqueda por nombre/DNI y filtros combinables por proveedor capturado, rol y Squad Asignado, además de `GET /api/v1/assignments/{id}`; verificar resultados enriquecidos y filtros vacíos o inexistentes.
- [x] 2.10 Extender `GET /api/v1/assignments` con filtros opcionales `start_date` y `end_date` usando intersección inclusiva de rangos; verificar límites exactos, filtros parciales y combinación con proveedor, rol y Squad Asignado mediante pytest.
- [x] 2.11 Actualizar modelos, esquemas y CRUD para recibir, validar y devolver `assigned_squad_id` y `executor_squad_id`, verificando que ambos Squads estén activos y que una creación con un ejecutor diferente conserve los dos valores mediante pytest.
- [x] 2.12 Mantener el filtro del listado únicamente por `assigned_squad_id` y devolver los nombres de ambos Squads en tabla/cards; verificar filtros combinados y compatibilidad con registros migrados.
- [x] 2.6 Implementar `POST /api/v1/assignments` capturando el proveedor vigente del miembro en la misma transacción; verificar miembros de planilla con proveedor nulo y tercerizados con snapshot persistente.
- [x] 2.7 Implementar `PATCH /api/v1/assignments/{id}` para editar Squad Asignado, proyecto, fechas y porcentaje conservando miembro, proveedor e identificador; verificar edición válida, conflicto de capacidad y referencias inactivas.
- [x] 2.8 Implementar `DELETE /api/v1/assignments/{id}` como eliminación física con respuesta `204`; verificar que el registro desaparezca, libere capacidad y devuelva 404 para identificadores inexistentes.
- [x] 2.9 Proteger candidatos, consultas y mutaciones con `Chapter Lead` y validar miembros/Squads activos; verificar respuestas de autorización y que ningún endpoint exponga acceso directo a Supabase.

## 3. Frontend y experiencia de asignaciones

- [x] 3.1 Agregar tipos TypeScript y funciones de API para candidatos, listado filtrado, detalle, creación, edición y eliminación; verificar TypeScript strict y conversión consistente de errores 409/422.
- [x] 3.2 Crear el modal reutilizable de alta/edición con búsqueda remota de miembros, datos read-only del colaborador, Squad Asignado, Squad Ejecutor, código, fechas y porcentaje; verificar labels, foco, Escape, cancelación, estados de carga y errores asociados.
- [x] 3.3 Implementar búsqueda de candidato con debounce y carga automática de DNI, nombre completo, proveedor, rol y seniority; verificar que el modo edición no permita cambiar miembro ni proveedor capturado.
- [x] 3.4 Crear el listado `/assignments` con búsqueda y filtros combinables por proveedor, rol y Squad Asignado, estados de carga/error/vacío y acción de nueva asignación; verificar que filtros y resultados se actualicen correctamente.
- [x] 3.9 Agregar al listado los filtros de fecha de inicio y fecha fin, conservarlos al cambiar entre tabla y cards y enviarlos como límites inclusivos; verificar resultados consistentes con la API.
- [x] 3.5 Implementar la vista tabular con miembro, DNI, proveedor, rol, seniority, Squad Asignado, Squad Ejecutor, proyecto, fechas, porcentaje y acciones de editar/eliminar; verificar navegación por teclado y lectura accesible de encabezados/estados.
- [x] 3.6 Implementar la vista de cards agrupada por Squad usando los mismos resultados y filtros de la tabla; verificar cambio de vista sin perder filtros y ausencia de overflow horizontal en móvil.
- [x] 3.10 Simplificar la vista de cards, omitir el código del Squad y mostrar en el encabezado de cada grupo el resumen de cantidades por rol calculado sobre las asignaciones visibles; verificar un caso como `3 Data Engineers, 2 Data Architects`.
- [x] 3.11 Actualizar tipos, API, formulario y tabla para mostrar/editar Squad Asignado y Squad Ejecutor; verificar que el ejecutor se sincronice por defecto con el asignado hasta una selección explícita diferente.
- [x] 3.12 Agregar subpestañas `Squad Asignado`/`Squad Ejecutor` a cards, iniciar en la primera y recalcular agrupaciones/resumen por rol al cambiar; verificar que los filtros permanezcan y que no se muestren códigos.
- [x] 3.13 Ocultar dentro de cada card los nombres de Squad Asignado y Squad Ejecutor, conservando las subpestañas y el encabezado del grupo para identificar la perspectiva activa.
- [x] 3.7 Implementar edición desde el listado y confirmación de eliminación; verificar actualización optimista o invalidación de consultas, bloqueo de envíos duplicados, liberación de capacidad y retorno de foco después del modal.
- [x] 3.8 Integrar la ruta y navegación del módulo con el layout existente y el sistema visual; verificar acceso restringido para roles no autorizados y cumplimiento de `docs/design-system.md`.

## 4. Verificación integrada y documentación

- [x] 4.1 Agregar pruebas backend para modelo, validaciones, candidatos, filtros, CRUD, snapshot de proveedor, conflictos de capacidad, eliminación y autorización; verificar que pytest, Ruff y mypy pasen.
- [x] 4.2 Agregar pruebas Playwright del alta desde modal, carga automática del miembro, filtro combinado en tabla/cards, edición, rechazo por exceso de capacidad y eliminación confirmada; verificar el flujo en viewport móvil.
- [x] 4.5 Ampliar las pruebas backend y Playwright para filtros de fechas inclusivos, persistencia de filtros entre vistas y resumen minimalista por rol en cards; verificar que no se muestre el código del Squad.
- [x] 4.6 Ampliar documentación y pruebas integradas para migración de Squads, creación/edición con ejecutor diferente, filtro por Squad Asignado y cambio de perspectiva en cards; verificar backend, build y Playwright del módulo.
- [x] 4.7 Actualizar la prueba E2E para verificar que las cards no muestran Squad Asignado ni Squad Ejecutor, mientras la tabla y el formulario mantienen esos datos.
- [x] 4.3 Documentar el contrato de `/api/v1/assignments`, reglas de solapamiento, precisión del porcentaje, variables de entorno y pasos para aplicar la migración en Supabase; verificar el build, lint y typecheck del frontend.
- [x] 4.4 Ejecutar la verificación final contra Supabase y la suite completa del proyecto; comprobar que la migración, API y frontend funcionen integrados y que el estado del cambio quede listo para archivar.
