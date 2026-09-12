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

La cabecera `X-User-Role` se acepta únicamente fuera de producción para facilitar pruebas locales. En producción se debe enviar un JWT de Supabase Auth y configurar `SUPABASE_JWT_SECRET`.
