# API de proveedores

La API administrativa de proveedores está disponible bajo `/api/v1/providers`.
Este módulo administra datos de negocio y no crea cuentas ni permisos para el
focal point.

## Campos

| Campo | Tipo | Requerido | Regla |
|---|---|---:|---|
| `name` | texto | Sí | Razón social; se recortan espacios exteriores |
| `ruc` | texto alfanumérico | Sí | Se guarda en mayúsculas y es único sin distinguir mayúsculas |
| `focal_point` | texto | Sí | Persona de contacto; se recortan espacios exteriores |
| `mobile` | texto | No | Número celular; puede ser nulo |
| `is_active` | booleano | — | Inicia en `true`; eliminar significa cambiarlo a `false` |

## Endpoints

- `POST /api/v1/providers`: crea un proveedor activo.
- `GET /api/v1/providers?status=all|active|inactive`: lista proveedores; por
  defecto devuelve ambos estados.
- `GET /api/v1/providers/{id}`: devuelve el detalle, incluso si está inactivo.
- `PATCH /api/v1/providers/{id}`: actualiza uno o más campos y permite
  reactivar con `is_active: true`.
- `DELETE /api/v1/providers/{id}`: desactiva lógicamente el proveedor; no
  elimina datos ni afiliaciones históricas.

Ejemplo de creación:

```json
{
  "name": "Proveedor Uno",
  "ruc": "AB123",
  "focal_point": "Ana Contacto",
  "mobile": "999999999"
}
```

El endpoint existente `GET /api/v1/catalogs/vendors` sigue devolviendo solo
proveedores activos para seleccionar un proveedor en el registro de miembros
tercerizados.

## Ejecución local

Desde `apps/api` (la API carga `.env` automáticamente y requiere Supabase):

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

La interfaz web se ejecuta desde `apps/web` con `npm run dev` y usa
`NEXT_PUBLIC_API_URL` para localizar la API.
