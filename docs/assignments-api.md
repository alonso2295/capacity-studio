# API de asignaciones

El módulo de asignaciones se consume desde el frontend mediante FastAPI. El navegador no conecta directamente con Supabase. Todas las rutas requieren el rol `Chapter Lead`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/assignments?search=&vendor_id=&professional_role_id=&assigned_squad_id=&start_date=&end_date=` | Lista asignaciones aplicando filtros combinables. `search` busca por DNI o nombre completo; `assigned_squad_id` filtra por Squad Asignado y las fechas por intersección inclusiva del rango. |
| GET | `/api/v1/assignments/candidates?search=` | Busca miembros activos para el modal e incluye proveedor vigente, rol y seniority. |
| GET | `/api/v1/assignments/{id}` | Devuelve una asignación enriquecida. |
| POST | `/api/v1/assignments` | Crea una asignación y captura el proveedor vigente del miembro. |
| PATCH | `/api/v1/assignments/{id}` | Actualiza Squad, proyecto, fechas o porcentaje. El miembro/proveedor capturado no cambia. |
| DELETE | `/api/v1/assignments/{id}` | Elimina físicamente la asignación y responde `204 No Content`. |

## Crear y editar

```json
{
  "member_id": "member-uuid",
  "assigned_squad_id": "squad-assigned-uuid",
  "executor_squad_id": "squad-executor-uuid",
  "project_code": "APP/CORE-2 + QA!",
  "start_date": "2026-01-01",
  "end_date": "2026-03-31",
  "allocation_percentage": 60.00
}
```

El código de proyecto se recorta y acepta letras, números, espacios, guiones, signos y símbolos imprimibles. El porcentaje acepta valores entre `0` y `100`, con hasta dos decimales. Las fechas son inclusivas y la fecha fin no puede ser anterior a la fecha de inicio.

El backend rechaza con `409 Conflict` una creación o edición que haga que la suma de porcentajes de un miembro supere el `100%` en cualquier día de solapamiento. Los rangos que no se superponen se validan de forma independiente. Al crear, el `vendor_id` se copia desde la afiliación vigente; si el miembro es de planilla se guarda `null`. El `executor_squad_id` puede coincidir con `assigned_squad_id` o representar otro Squad.

Los filtros `start_date` y `end_date` son opcionales y también inclusivos: una asignación coincide si su fecha fin es mayor o igual a `start_date` y su fecha inicio es menor o igual a `end_date`. Si solo se envía uno de los límites, se aplica únicamente esa condición.

## Migración y desarrollo local

Desde `apps/api`, con las variables de Supabase configuradas en `.env`:

```bash
../../.venv/bin/alembic upgrade head
```

Las migraciones `005_create_assignments`, `006_split_assignment_squads` y `007_add_executor_squad_fk` crean la tabla, restricciones de fechas/porcentaje, referencias e índices. La migración `006` renombra el Squad existente como `assigned_squad_id` y lo copia a `executor_squad_id`; la `007` garantiza la FK del Squad Ejecutor. Para revisar el estado:

```bash
../../.venv/bin/alembic current
```

El frontend usa `NEXT_PUBLIC_API_URL` y, en desarrollo, `NEXT_PUBLIC_DEV_USER_ROLE=Chapter Lead` para enviar el encabezado de rol.
