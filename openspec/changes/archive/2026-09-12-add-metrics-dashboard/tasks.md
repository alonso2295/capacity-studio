## 1. Backend y contrato de métricas

- [x] 1.1 Crear utilidades y esquemas para validar año/trimestre, calcular límites inclusivos y representar la respuesta consolidada del dashboard; verificar trimestres `Q1`–`Q4` y límites de año.
- [x] 1.2 Implementar la consulta agregada de `GET /api/v1/metrics/dashboard` con KPIs, distribución por `Squad Ejecutor`, proveedor/rol, miembros sin asignación y renuncias; verificar miembros únicos y exclusión de `member_resigned`.
- [x] 1.3 Permitir acceso al endpoint sin `require_chapter_lead`, manteniendo la autenticación general de la aplicación; verificar acceso de usuarios con distintos roles y rechazo solo para solicitudes no autenticadas si corresponde al middleware existente.

## 2. Frontend y navegación

- [x] 2.1 Agregar tipos TypeScript y funciones API para la respuesta de métricas, año/trimestre y detalle de miembros sin asignación; verificar `typecheck`.
- [x] 2.2 Crear la ruta `/metrics`, agregar el acceso desde la pantalla principal y mantener año/trimestre como estado de consulta; verificar selección por defecto del trimestre actual y refresco de métricas.
- [x] 2.3 Implementar estados de carga, error, vacío y reintento sin mezclar datos de un trimestre anterior con el estado actual; verificar comportamiento con respuestas lentas y fallidas.
- [x] 2.4 Agregar un botón o enlace accesible en `/metrics` para volver a la página central de gestión (`/`).

## 3. Visualizaciones y detalle

- [x] 3.1 Implementar tarjetas KPI para Squads, miembros asignados, miembros sin asignación y renuncias, incluyendo la métrica adicional de miembros asignados; verificar valores numéricos y exclusión de renuncias operativas.
- [x] 3.2 Implementar la distribución de roles agrupada por `Squad Ejecutor` con valores numéricos y excluir asignaciones marcadas como renuncia; verificar miembros únicos por combinación Squad/rol.
- [x] 3.3 Implementar la distribución de miembros por proveedor capturado y rol, agrupando planilla como `Planilla`; verificar snapshots de proveedor y miembros únicos.
- [x] 3.4 Implementar la ventana accesible de detalle de miembros sin asignación con nombre completo y DNI; verificar apertura, cierre por botón/Escape, foco y estado vacío.

## 4. Verificación integrada

- [x] 4.1 Agregar pruebas backend para intersección inclusiva, KPIs, exclusión de renuncias, miembros únicos, proveedor capturado, miembros sin asignación y autorización sin restricción de rol administrativo.
- [x] 4.2 Agregar pruebas Playwright para filtros de año/trimestre, KPI de renuncias, distribución por Squad Ejecutor, detalle de no asignados, navegación a la página central y viewport móvil.
- [x] 4.3 Ejecutar Ruff, mypy, pytest, typecheck, build y suite E2E relevante; verificar el endpoint contra PostgreSQL/Supabase y documentar el resultado.
