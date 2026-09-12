## Context

El proyecto ya persiste miembros, proveedores y Squads en PostgreSQL mediante SQLAlchemy/Alembic y expone sus operaciones desde FastAPI. El frontend Next.js usa TanStack Query, React Hook Form y Zod; actualmente existen patrones de listados, formularios y cambios de estado para proveedores, miembros y Squads. La motivación y el comportamiento esperado están definidos en `proposal.md` y `specs/assignments/spec.md`.

La validación de capacidad es el punto técnico principal: los rangos de asignación son inclusivos y el total de porcentajes de un miembro no puede superar 100% en ningún día, incluso cuando hay varios rangos con fechas distintas.

## Goals / Non-Goals

**Goals:**

- Añadir una entidad de asignación referenciada a miembro, Squad Asignado y Squad Ejecutor, con snapshot del proveedor vigente.
- Exponer un contrato REST para búsqueda de candidatos, filtros, consulta, creación, edición y eliminación.
- Garantizar la regla de capacidad acumulada también frente a solicitudes concurrentes.
- Proporcionar tabla y cards agrupadas por Squad con filtros compartidos, incluyendo fechas inclusivas y un resumen de perfiles por rol en cards; las cards tendrán perspectivas de Squad Asignado y Squad Ejecutor.
- Implementar el alta y la edición en un modal accesible, responsive y consistente con el sistema visual.

**Non-Goals:**

- Cambiar el modelo de autenticación de Supabase ni crear roles nuevos.
- Crear un catálogo separado de proyectos; el código de proyecto será texto almacenado en la asignación.
- Crear snapshots históricos de rol o seniority; ambos se consultarán desde el miembro asociado. El proveedor sí se almacenará en la asignación porque el requerimiento exige conservarlo ante cambios futuros.
- Gestionar aprobaciones, planificación de vacaciones, feriados o capacidad distinta de la suma porcentual por día.
- Implementar paginación o exportación en esta primera versión, salvo que el volumen observado durante la implementación lo vuelva necesario.

## Decisions

### Modelo de datos y snapshot del proveedor

Se agregará una tabla `assignments` con:

- `id` como identificador UUID/string, `member_id`, `assigned_squad_id` y `executor_squad_id` como referencias obligatorias.
- `vendor_id` nullable como referencia al proveedor capturado al crear la asignación; para un miembro de planilla será `NULL`.
- `project_code` como texto no vacío, con longitud máxima documentada y sin una restricción de caracteres que impida símbolos o guiones.
- `start_date` y `end_date` como fechas inclusivas, con una restricción `end_date >= start_date`.
- `allocation_percentage` como decimal entre 0 y 100, con una precisión fija de hasta dos decimales.
- `created_at` y `updated_at` con timestamps.

El endpoint de creación resolverá la afiliación vigente del miembro dentro de la transacción y copiará su `vendor_id`. El cliente inicializará `executor_squad_id` con `assigned_squad_id`; mientras el ejecutor no haya sido cambiado explícitamente, seguirá sincronizado con el asignado. Después de una selección explícita diferente, ambos valores serán independientes. El endpoint de edición permitirá cambiar ambos Squads, pero no miembro ni proveedor capturado. Se mantendrán las referencias a ambos Squads porque pueden desactivarse sin perder el contexto histórico. La eliminación de una asignación será física y solo afectará esa fila.

La migración renombrará la referencia actual `squad_id` a `assigned_squad_id`, agregará `executor_squad_id` como obligatorio y poblará el nuevo campo con el valor anterior de `squad_id`, de modo que los registros existentes comiencen con ambos Squads iguales.

**Alternativa descartada:** calcular el proveedor desde la afiliación actual cada vez que se consulte la asignación. Se descarta porque perdería el contexto histórico explícitamente solicitado.

### Contrato de API

El backend expondrá estas rutas, todas protegidas por `require_chapter_lead`:

- `GET /api/v1/assignments?search=&vendor_id=&professional_role_id=&assigned_squad_id=&start_date=&end_date=` lista asignaciones y aplica filtros combinados. `search` buscará por DNI y nombre completo; `assigned_squad_id` filtrará únicamente por Squad Asignado. Cuando se indique un rango de fechas, la consulta usará intersección inclusiva: `assignment.end_date >= start_date` y `assignment.start_date <= end_date`; cualquiera de los límites podrá enviarse por separado.
- `GET /api/v1/assignments/candidates?search=` devuelve miembros activos que coinciden con DNI o nombre, incluyendo DNI, nombre completo, proveedor vigente, rol y seniority para el selector del modal.
- `GET /api/v1/assignments/{id}` devuelve el detalle enriquecido de una asignación.
- `POST /api/v1/assignments` crea una asignación con Squad Asignado y Squad Ejecutor y captura el proveedor vigente.
- `PATCH /api/v1/assignments/{id}` actualiza ambos Squads, código, fechas y porcentaje sin cambiar miembro ni proveedor.
- `DELETE /api/v1/assignments/{id}` elimina físicamente la asignación y responde con `204 No Content`.

Los conflictos por capacidad responderán con `409 Conflict` e incluirán un mensaje legible y, cuando sea posible, la fecha o fechas donde se alcanzaría el exceso. Las referencias inexistentes o inactivas responderán con `404` o `422` según corresponda; los errores de validación de campos usarán `422`.

Los filtros de proveedor, rol y Squad Asignado usarán identificadores. Para que el usuario pueda filtrar asignaciones históricas, el frontend cargará proveedores y Squads con activos e inactivos cuando corresponda; la respuesta de la asignación conservará los nombres de ambos Squads para no depender de que un catálogo siga activo.

### Validación de capacidad y concurrencia

Para una operación de creación o edición se tomará el rango inclusivo `[start_date, end_date]`. Se consultarán las asignaciones del mismo miembro cuyo rango se intersecte con el rango propuesto (`existing.start_date <= proposed.end_date` y `existing.end_date >= proposed.start_date`), excluyendo la asignación actual durante una edición.

La API calculará el máximo diario con un barrido de eventos: suma el porcentaje al comenzar cada rango y lo resta al día siguiente de terminarlo. Si el máximo incluyendo el nuevo valor es mayor que 100, la operación se rechaza. Este algoritmo evita asumir que todos los rangos tienen exactamente las mismas fechas.

Para evitar que dos solicitudes simultáneas superen el límite, la transacción bloqueará la fila del miembro antes de leer y validar sus asignaciones. La creación o edición y su validación se confirmarán en la misma transacción. El backend será la única autoridad de esta regla; la previsualización del frontend es orientativa.

**Alternativa descartada:** validar únicamente sumando todas las asignaciones del miembro o confiar en una restricción única de base de datos. Ambas opciones no representan correctamente rangos parciales y no pueden imponer por sí solas un máximo acumulado por día.

### Consulta y representación frontend

La ruta `/assignments` tendrá un estado de filtros compartido y un selector de vista `Tabla`/`Cards`. El estado incluirá búsqueda, proveedor, rol, Squad Asignado, fecha de inicio y fecha de fin. TanStack Query usará todos los filtros como parte de la clave de consulta para invalidar y refrescar resultados después de crear, editar o eliminar. Las fechas se enviarán como límites inclusivos del rango consultado.

La tabla mostrará miembro, DNI, proveedor capturado, rol, seniority, Squad Asignado, Squad Ejecutor, proyecto, fechas, porcentaje y acciones. La vista de cards tendrá dos subpestañas locales, `Squad Asignado` y `Squad Ejecutor`, con `Squad Asignado` activa inicialmente. Ambas usarán el mismo resultado filtrado; al cambiar la subpestaña se recalculará localmente el agrupamiento por el nombre del campo seleccionado y el resumen agregado por rol, por ejemplo `3 Data Engineers, 2 Data Architects`, sin una nueva consulta. No se mostrarán códigos de Squad en las cards.

El modal reutilizable tendrá dos modos:

- **Crear:** buscador con debounce para miembros activos; al seleccionar un candidato, mostrará sus datos contextuales en controles read-only y permitirá elegir Squad Asignado, elegir opcionalmente otro Squad Ejecutor y completar proyecto, fechas y porcentaje. El control de ejecutor se inicializará con el asignado y permanecerá sincronizado hasta una selección explícita diferente.
- **Editar:** mostrará miembro y proveedor como contexto read-only y permitirá modificar ambos Squads y los demás campos editables de la asignación.

El modal gestionará foco de entrada y retorno, cierre con Escape y botón visible, mensajes de error asociados, estado de guardado y confirmación antes de eliminar. En móvil se mostrará en una sola columna; la tabla usará desplazamiento interno o una alternativa compacta sin producir overflow horizontal de la página; las cards no mostrarán nombres ni códigos de Squad dentro de su contenido. La perspectiva seguirá visible mediante las subpestañas y el nombre del Squad en el encabezado de cada grupo.

### Integración de catálogos y Supabase

El navegador solo llamará al backend. El backend resolverá miembros, afiliaciones, proveedores, roles y ambos Squads mediante SQLAlchemy contra la conexión PostgreSQL configurada para Supabase. Se agregará una migración Alembic con claves foráneas, índices para miembro/fechas, Squad Asignado, Squad Ejecutor y filtros frecuentes, y la restricción del rango de fechas. La migración conservará los datos históricos existentes mediante el backfill descrito anteriormente.

## Risks / Trade-offs

- **[Riesgo]** Dos solicitudes concurrentes podrían validar el mismo porcentaje disponible. → **Mitigación:** bloquear la fila del miembro dentro de la transacción y repetir la validación en el backend; cubrirlo con una prueba de integración.
- **[Riesgo]** La eliminación física puede afectar reportes futuros. → **Mitigación:** exigir confirmación, restringir la acción a Chapter Lead y documentar que la asignación es un registro corregible, mientras que miembro, proveedor y Squad conservan su historial propio.
- **[Riesgo]** Una lista grande de candidatos puede volver pesado el modal. → **Mitigación:** búsqueda remota con debounce, límite de resultados y carga solo de miembros activos.
- **[Riesgo]** Proveedores o Squads inactivos pueden no aparecer en los catálogos por defecto. → **Mitigación:** el endpoint de asignaciones devuelve nombres capturados y los filtros administrativos podrán solicitar catálogos incluyendo inactivos.
- **[Riesgo]** Los usuarios pueden interpretar de forma distinta los límites de un filtro de fechas. → **Mitigación:** documentar y probar la intersección inclusiva, incluyendo asignaciones que comienzan o terminan exactamente en los límites seleccionados.
- **[Riesgo]** El cambio de perspectiva puede confundirse con un cambio de filtro. → **Mitigación:** mantener el filtro de Squad únicamente sobre Squad Asignado, etiquetar claramente las subpestañas y recalcular solo la agrupación visual al cambiar de perspectiva.
- **[Riesgo]** Registros existentes no tendrían un Squad Ejecutor. → **Mitigación:** migrar `squad_id` a ambos campos, usando el valor anterior como Squad Asignado y Squad Ejecutor.
- **[Trade-off]** Rol y seniority reflejarán el valor actual del miembro, no un snapshot histórico. → **Mitigación:** se documenta explícitamente en el contrato y se evita duplicar datos hasta que exista un requerimiento de historial para esos campos.
- **[Trade-off]** La vista de cards repetirá parte de la información de la tabla. → **Mitigación:** compartir consulta y filtros, usar una composición compacta y concentrar el resumen de roles en el encabezado de cada grupo.

## Migration Plan

1. Crear y probar la migración Alembic de `assignments` contra PostgreSQL/Supabase, renombrando `squad_id` a `assigned_squad_id` y poblando `executor_squad_id` con el valor anterior.
2. Desplegar el backend con modelos, esquemas, reglas de capacidad y endpoints.
3. Desplegar el frontend con listado, filtros, modal, tabla y cards.
4. Verificar autorización, CRUD, captura del proveedor, solapamientos y responsive con pruebas unitarias, integración y Playwright.

El rollback de la aplicación consiste en retirar rutas y endpoints sin tocar miembros, proveedores ni Squads. La migración solo podrá revertirse mientras no existan asignaciones que deban conservarse; una vez que haya datos reales, la reversión requerirá una decisión explícita de negocio y respaldo de Supabase.
