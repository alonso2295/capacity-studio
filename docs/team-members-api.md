# API de administración de miembros

## Base URL

El frontend usa `NEXT_PUBLIC_API_URL`. En local, el valor recomendado es `http://localhost:8000`.

## Autorización

Las rutas de catálogos y todas las operaciones de miembros requieren un usuario autenticado con rol `Chapter Lead`.

- Producción: `Authorization: Bearer <supabase-jwt>`.
- Desarrollo local: `X-User-Role: Chapter Lead` solo cuando `ENVIRONMENT` no es `production`.

## Catálogos

`GET /api/v1/catalogs/professional-roles` y `GET /api/v1/catalogs/vendors` devuelven arreglos de `{ "id": string, "name": string }` y solo incluyen registros activos.

## Crear miembro

`POST /api/v1/members`

```json
{
  "dni": "12345678",
  "first_name": "Ana",
  "paternal_surname": "Pérez",
  "maternal_surname": "Gómez",
  "email": "ana@example.com",
  "mobile": "999999999",
  "birth_date": "1990-01-01",
  "employment_type": "PLANILLA",
  "vendor_id": null,
  "professional_role_id": "role-1",
  "seniority": "MEDIUM"
}
```

`employment_type` acepta `PLANILLA` o `TERCERIZADO`; para tercerizados `vendor_id` es obligatorio. `seniority` acepta `MEDIUM` o `SENIOR`. El API normaliza el correo a minúsculas, elimina espacios sobrantes y rechaza DNI/correo duplicados con HTTP 409.

La respuesta exitosa es HTTP 201 y no contiene credenciales ni secretos. Las variables de conexión a Supabase deben mantenerse únicamente en el entorno del backend.

## Consultar miembros

- `GET /api/v1/members?status=active` lista miembros activos (valor predeterminado).
- `GET /api/v1/members?status=inactive` lista miembros desactivados.
- `GET /api/v1/members?status=all` lista todos los miembros.
- `GET /api/v1/members/{id}` devuelve el detalle, el estado y el historial de afiliaciones con proveedores.

Las respuestas incluyen `vendor_name`, `professional_role_name` y `affiliations`. Los miembros inactivos se conservan para consulta histórica y no deben ofrecerse en nuevas asignaciones.

## Editar y cambiar estado

`PATCH /api/v1/members/{id}` actualiza uno o más campos del miembro. El cuerpo usa los mismos nombres y reglas que el alta; también acepta `is_active: true` para reactivar un miembro.

`DELETE /api/v1/members/{id}` desactiva lógicamente el miembro. No borra el registro ni sus afiliaciones y equivale a establecer `is_active: false`. Los cambios de proveedor cierran la afiliación vigente y crean una nueva, conservando el historial.
