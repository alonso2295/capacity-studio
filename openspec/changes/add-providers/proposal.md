## Why

Capacity Studio necesita un catálogo administrable de empresas proveedoras para
relacionarlas con miembros tercerizados y mantener información de contacto
confiable. Actualmente existe una entidad mínima de proveedores, pero no hay un
flujo para registrar, consultar, editar o desactivar sus datos.

## What Changes

- Crear la capacidad `providers` para administrar proveedores mediante un CRUD
  completo.
- Registrar razón social, RUC, focal point, número celular y estado.
- Hacer obligatorios la razón social, el RUC y el focal point; mantener el
  número celular como opcional.
- Validar el RUC como texto alfanumérico único, normalizado sin espacios
  sobrantes y sin distinguir mayúsculas.
- Permitir consultar proveedores activos e inactivos y filtrar el listado por
  estado.
- Implementar edición de datos y cambio explícito de estado.
- Implementar la eliminación como desactivación lógica, conservando el
  proveedor para referencias y consultas históricas; permitir su reactivación.
- Mantener el registro de proveedores separado de autenticación y autorización,
  que se administrarán en una etapa posterior.

## Capabilities

### New Capabilities

- `providers`: Registro, consulta, edición, activación y desactivación lógica
  de empresas proveedoras.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nueva pantalla responsive para listado, alta, edición, detalle y
  cambio de estado de proveedores en `apps/web`.
- **Backend:** endpoints REST versionados, validación, normalización y errores
  de dominio en `apps/api`.
- **Base de datos:** ampliación de `vendors` con RUC, focal point y celular;
  restricciones de unicidad e índices necesarios mediante Alembic.
- **Integración:** el catálogo de proveedores activos seguirá disponible para
  el registro de miembros tercerizados.
- **Autorización:** fuera del alcance funcional de este cambio; el módulo no
  creará cuentas ni gestionará roles.
- **Pruebas:** validaciones de API, persistencia, unicidad, desactivación,
  reactivación y flujo responsive del CRUD.
