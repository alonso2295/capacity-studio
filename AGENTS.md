# Repository Guidelines

## Project Structure & Module Organization

Capacity Studio is organized as two independently runnable applications:

- `apps/web/` contains the Next.js App Router frontend. Routes live in `app/`, reusable UI in `components/`, shared client/API types in `lib/`, and browser tests in `tests/e2e/`.
- `apps/api/` contains the FastAPI service. Application code is in `app/`, database migrations are in `migrations/`, and pytest tests are in `tests/`.
- `docs/` contains API and design-system documentation. `openspec/changes/` contains proposals, designs, specs, and task lists for product changes.

## Build, Test, and Development Commands

Run frontend commands from `apps/web`:

```bash
npm install                 # install dependencies
npm run dev                 # start Next.js locally on port 3000
npm run build               # create a production build
npm run lint                # run ESLint
npm run typecheck           # run TypeScript without emitting files
npm run test:e2e            # run Playwright browser tests
```

Run backend commands from `apps/api` after creating `.env` from `.env.example`:

```bash
pip install -e '.[test,quality]'
alembic upgrade head        # apply PostgreSQL migrations
uvicorn app.main:app --reload --port 8000
pytest                      # run API tests
ruff check . && mypy app    # run static quality checks
```

The API expects PostgreSQL/Supabase configuration; never commit populated `.env` files or secrets.

## Coding Style & Naming Conventions

Use two spaces in frontend TypeScript/TSX and follow the existing double-quoted style. Name React components and files in `PascalCase` only where the existing convention does so; current component files are generally kebab-case (for example, `member-form.tsx`). Use `camelCase` for variables and functions. Python targets 3.12, uses four-space indentation, `snake_case` names, and an 110-character Ruff line limit. Keep API schemas, models, routes, and migrations separated by responsibility.

## Testing Guidelines

Add backend tests in `apps/api/tests/test_<resource>.py` and frontend flows in `apps/web/tests/e2e/<feature>.spec.ts`. Run the relevant suite plus type/lint checks for UI changes. Playwright starts or reuses the local frontend; ensure the API is running and test data/configuration is available.

## Commit & Pull Request Guidelines

The current history only contains `Initial commit` and `First Commit`, so no established convention is present. Prefer short, imperative subjects (for example, `Add assignment capacity validation`). PRs should describe behavior and affected apps, link the relevant OpenSpec change or issue, list validation commands, and include screenshots for UI changes. Mention migration or environment-variable changes explicitly.
