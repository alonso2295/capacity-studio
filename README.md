# Capacity Studio

Aplicación interna para gestionar miembros de Ingeniería de Datos y sus asignaciones a Squads.

## Estructura

- `apps/web`: frontend Next.js responsive.
- `apps/api`: backend FastAPI y migraciones Alembic.
- `docs`: sistema visual y reglas de interacción.
- `openspec`: propuestas, especificaciones, diseños y tareas.

## Desarrollo local

### API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e '.[test,quality]'
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

En desarrollo, la API permite levantar el prototipo sin credenciales. En producción, Render debe configurar `ENVIRONMENT=production`, `FRONTEND_ORIGIN`, `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH`. Este último valor debe ser un hash Argon2 generado fuera del repositorio; nunca guardes la contraseña en Git ni en Vercel.

Vercel solo necesita `NEXT_PUBLIC_API_URL` con la URL pública del backend. El frontend envía la credencial Basic durante la sesión de la pestaña y usa HTTPS en producción. El endpoint `/health` permanece público para Render; todas las rutas bajo `/api/v1` requieren autenticación y otorgan el rol `Chapter Lead`.
