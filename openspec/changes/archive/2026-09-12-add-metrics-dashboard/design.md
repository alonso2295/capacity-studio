## Context

El sistema ya persiste asignaciones con `start_date`, `end_date`, `allocation_percentage`, `member_resigned`, proveedor capturado, rol del miembro, `assigned_squad_id` y `executor_squad_id`. El frontend usa Next.js, TanStack Query y Tailwind; el backend usa FastAPI y SQLAlchemy contra PostgreSQL/Supabase. No existe actualmente una librería de gráficos ni un módulo de métricas.

## Goals / Non-Goals

**Goals:**

- Exponer una respuesta agregada para un año/trimestre.
- Aplicar una única definición de intersección trimestral y exclusión de renuncias en todas las métricas operativas.
- Usar `Squad Ejecutor` como dimensión de Squad.
- Entregar KPIs, distribuciones y detalle de miembros sin asignación en una pantalla responsive y accesible.
- Ofrecer una acción visible para volver a la página central de gestión.
- Permitir consulta a cualquier usuario autenticado sin la dependencia de `require_chapter_lead`.

**Non-Goals:**

- No modificar asignaciones ni crear un CRUD dentro del módulo.
- No crear snapshots nuevos de roles, miembros o proveedores; se utilizarán los valores actuales del miembro y el proveedor capturado de cada asignación.
- No incluir una visualización de evolución de roles en este módulo.
- No calcular históricos de `is_active` porque el modelo actual no tiene vigencia histórica de miembros; se utilizará el estado activo actual.
- No incorporar una librería de gráficos externa en esta primera versión.

## Decisions

### Contrato de consulta

El backend expondrá `GET /api/v1/metrics/dashboard?year=<YYYY>&quarter=<1-4>`. La respuesta incluirá:

- `period`: año, trimestre, fecha inicial y fecha final.
- `kpis`: `total_squads`, `assigned_members`, `unassigned_active_members` y `resigned_members`.
- `role_distribution_by_executor_squad`: grupos por ID/nombre de Squad Ejecutor con cantidades por rol.
- `unassigned_members`: lista de ID, nombre completo y DNI para el modal.
- `members_by_vendor_and_role`: filas con proveedor, rol y cantidad.

`year` y `quarter` se validarán antes de consultar. El endpoint no aplicará `require_chapter_lead`; si la aplicación tiene una capa general de autenticación, se conservará esa capa.

### Definición de trimestre y conjuntos

Una utilidad compartida calculará `quarter_start` y `quarter_end`. La condición de intersección será `assignment.end_date >= quarter_start` y `assignment.start_date <= quarter_end`.

Para el periodo seleccionado se creará un conjunto operativo de asignaciones que intersectan el trimestre y tienen `member_resigned = false`. Las métricas de Squads, roles, proveedores y miembros asignados se construirán sobre miembros únicos de ese conjunto. El conjunto de renuncias utilizará asignaciones que intersectan el trimestre y `member_resigned = true`, contando miembros únicos. Los miembros sin asignación serán miembros activos actuales cuyo ID no esté en el conjunto operativo.

**Alternativa descartada:** contar filas de asignaciones. Se descarta porque una persona puede tener varias asignaciones simultáneas y eso inflaría los KPIs y distribuciones.

### Proveedor y rol

La dimensión de proveedor usará `assignments.vendor_id/vendor_name`, que representa el snapshot vigente al momento de crear la asignación. Cuando `vendor_id` sea `NULL`, la respuesta usará `Planilla`. El rol y seniority se leerán del miembro asociado, siguiendo el comportamiento actual de asignaciones.

### Representación frontend

La ruta `/metrics` mantendrá `year` y `quarter` en estado local y usará ambos valores en la clave de TanStack Query. La pantalla se organizará así:

1. Encabezado con filtros de año/trimestre.
2. Tarjetas KPI para Squads, miembros asignados, sin asignación y renuncias.
3. Distribución de roles por Squad Ejecutor mediante barras horizontales o grupos compactos con valores numéricos.
4. Tabla o matriz de proveedor/rol.

El encabezado incluirá un enlace o botón `Volver a gestión central` que navegue a `/`.

El KPI de miembros sin asignación tendrá un botón `Ver detalle` que abrirá un modal accesible con nombre completo y DNI. Los valores numéricos acompañarán cada visualización para que la información no dependa del color.

### Rendimiento y consistencia

La consulta calculará las agregaciones en PostgreSQL y devolverá una respuesta consolidada para evitar múltiples lecturas inconsistentes entre tarjetas y gráficos. Se agregarán índices o ajustes de consulta solo si las pruebas de volumen lo justifican; las columnas existentes de fechas, miembro, proveedor y Squads ya soportan los filtros principales.

## Risks / Trade-offs

- **[Riesgo]** El estado activo actual de un miembro no representa necesariamente su estado histórico en un trimestre pasado. → **Mitigación:** documentar esta limitación y usar `is_active` actual hasta que exista vigencia histórica del miembro.
- **[Riesgo]** Un miembro con snapshots de proveedor distintos puede aparecer en más de una combinación proveedor/rol. → **Mitigación:** usar explícitamente el proveedor capturado de cada asignación y contar miembros únicos por combinación.
- **[Riesgo]** El volumen de asignaciones puede hacer pesada la respuesta consolidada. → **Mitigación:** agregar en base de datos, limitar el detalle a nombre/DNI y medir la consulta con datos representativos.

## Migration Plan

1. Implementar el contrato y las consultas de métricas sin modificar el esquema de datos.
2. Agregar pruebas de agregación y validar la respuesta contra PostgreSQL/Supabase.
3. Incorporar la ruta frontend, filtros, KPIs, visualizaciones y modal responsive.
4. Verificar acceso para distintos roles autenticados, estados vacíos y rendimiento básico.

No se requiere migración Alembic ni rollback de datos. El rollback de aplicación consiste en retirar la ruta y el endpoint de métricas.
