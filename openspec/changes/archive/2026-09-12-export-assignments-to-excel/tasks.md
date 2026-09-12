## 1. Backend export foundation

- [x] 1.1 Add the XLSX generation dependency to apps/api/pyproject.toml and verify the API test/quality extras install successfully.
- [x] 1.2 Extract or reuse the assignment filter/query construction so the list and export paths share search, provider, role, Squad Asignado, date, and resignation semantics; verify existing assignment tests remain green.
- [x] 1.3 Add an authorized GET export endpoint that accepts the active filters and optional sort, ignores page/page_size, and returns an XLSX attachment with a deterministic filename; verify response media type, disposition, and authorization with API tests.
- [x] 1.4 Generate the workbook with one Asignaciones sheet, the nine ordered headers, Planilla fallback, native date values, and usable numeric percentage formatting; verify populated and empty exports by reading the workbook in tests.

## 2. Backend verification and documentation

- [x] 2.1 Add API tests covering combined filters, inclusive date boundaries, all matching rows across pagination, exact column order, field mapping, and Planilla fallback; verify with pytest apps/api/tests/test_assignments.py.
- [x] 2.2 Add API tests for unauthorized access, export failures, and no-match results; verify the expected status or valid header-only workbook without changing list behavior.
- [x] 2.3 Document the export endpoint, query parameters, file format, and column contract in docs/assignments-api.md; verify the documented request matches the implemented route.

## 3. Frontend integration

- [x] 3.1 Add a typed client function that serializes current assignment filters and sort state, requests the XLSX blob, and triggers a browser download without replacing the paginated query; verify query parameters with a frontend test or route assertion.
- [x] 3.2 Add an accessible Descargar Excel control to the assignments module with pending, disabled, success, and error states while preserving filters and visible results; verify keyboard access and user-facing status in Playwright.
- [x] 3.3 Add an E2E scenario that applies filters, downloads the file, and verifies the request contains those filters and does not use the visible page size as an export limit; verify the existing assignment flows still pass.

## 4. Quality checks

- [x] 4.1 Run ruff check ., mypy app, pytest, npm run lint, and npm run typecheck from their respective app directories; resolve regressions introduced by the export feature.
- [x] 4.2 Run npm run test:e2e with the API configured and confirm the filtered Excel download works in the supported mobile Chromium project.
