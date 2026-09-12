# API de administración de Squads

## Base URL

El frontend usa `NEXT_PUBLIC_API_URL`. En local, el valor recomendado es `http://localhost:8000`.

## Autorización

Todas las rutas de Squads requieren el rol `Chapter Lead`.

- Producción: `Authorization: Bearer <supabase-jwt>`.
- Desarrollo local: `X-User-Role: Chapter Lead` cuando `ENVIRONMENT` no es `production`.

## Endpoints

- `POST /api/v1/squads`: crea un Squad activo.
- `GET /api/v1/squads?status=active|inactive|all`: lista Squads; el valor predeterminado es `active`.
- `GET /api/v1/squads/{id}`: devuelve el detalle, incluso si está inactivo.
- `PATCH /api/v1/squads/{id}`: actualiza datos y acepta `is_active: true` para reactivar.
- `DELETE /api/v1/squads/{id}`: desactiva lógicamente el Squad y conserva sus datos.

## Crear un Squad

`POST /api/v1/squads`

```json
{
  "code": "DATA01",
  "name": "Data Platform",
  "tribe": "Growth",
  "product_owner_name": "Luis PO"
}
```

El código acepta únicamente letras y números, se normaliza a mayúsculas y es único sin distinguir mayúsculas. `code` y `name` son obligatorios; `tribe` y `product_owner_name` son opcionales. Un código duplicado responde HTTP 409.

Las credenciales de Supabase deben mantenerse únicamente en el backend. La eliminación no borra filas: establece `is_active` en `false`.
