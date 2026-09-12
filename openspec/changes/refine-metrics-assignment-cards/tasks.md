## 1. Presentación y ordenamiento de cards

- [x] 1.1 Actualizar `AssignmentCard` en `apps/web/components/metrics-dashboard.tsx` para mantener visibles los valores de rol, proveedor y proyecto, ocultar visualmente solo sus rótulos y conservar semántica accesible; verificar que la estructura siga siendo compacta y responsive.
- [x] 1.2 Implementar un comparador estable de cards por rol profesional ascendente, proveedor visible ascendente, nombre completo e identificador; aplicarlo a las cards de cada grupo después de agruparlas y verificar que `Data Architect` preceda a `Data Engineer`.
- [x] 1.3 Confirmar que el ordenamiento se conserva al cambiar entre Squad Asignado y Squad Ejecutor y al aplicar filtros, sin modificar el conjunto de cards, la agrupación, los estados existentes ni las métricas ejecutivas; verificar con la suite E2E de métricas.

## 2. Pruebas y validación

- [x] 2.1 Ampliar el mock de `apps/web/tests/e2e/metrics.spec.ts` con varias cards del mismo grupo, roles arquitecto/ingeniero y proveedores distintos; verificar el orden por rol y proveedor mediante la posición observable de los artículos.
- [x] 2.2 Agregar aserciones E2E que comprueben la presencia de los valores de rol, proveedor y proyecto, la ausencia visual de los textos exactos `Rol`, `Proveedor` y `Proyecto`, el valor `Planilla` y el orden en ambas perspectivas; verificar también que no exista overflow horizontal en móvil.
- [x] 2.3 Ejecutar `npm run typecheck`, `npm run lint` y `npx playwright test tests/e2e/metrics.spec.ts` desde `apps/web`, además de `pytest tests/test_assignments.py` desde `apps/api`, y corregir cualquier regresión relacionada con el cambio.
