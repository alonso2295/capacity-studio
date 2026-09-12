# Proposal: Registrar y administrar miembros del equipo

## Why

Capacity Studio necesita un registro centralizado y consistente de las personas que pueden ser asignadas a los Squads. Actualmente no existe un flujo definido para registrar y administrar sus datos personales, información de contacto, tipo de vínculo laboral y perfil profesional a lo largo de su ciclo de vida.

Este módulo permitirá que el Chapter Lead mantenga una base confiable y vigente de miembros para los futuros módulos de asignaciones, disponibilidad y consulta de capacidad, conservando el historial cuando un miembro deje de estar activo.

## What Changes

- Crear la capacidad `team-members` para registrar y administrar miembros del equipo desde una interfaz web responsive.
- Mostrar un listado consultable de miembros con su estado, permitir consultar el detalle y filtrar por estado activo o inactivo.
- Incluir los datos personales y de contacto solicitados: DNI, nombres, apellidos, correo, celular y fecha de nacimiento.
- Incluir `Tipo de vínculo` con las opciones `Planilla` y `Tercerizado`.
- Permitir seleccionar un `Proveedor` únicamente cuando el tipo de vínculo sea `Tercerizado`; conservar la relación histórica de proveedor para cambios futuros.
- Incluir un selector de `Rol profesional`, independiente del rol de acceso a la aplicación.
- Incluir `Seniority` con las opciones `Medium` y `Senior`.
- Validar datos obligatorios, formatos, duplicidad de DNI/correo y las reglas condicionales del proveedor.
- Permitir editar los datos de un miembro aplicando las mismas validaciones del registro y conservando el historial de sus afiliaciones con proveedores.
- Implementar la eliminación como desactivación lógica: no borrar físicamente el miembro, impedir nuevas asignaciones mientras esté inactivo y permitir reactivarlo.
- Permitir el registro únicamente a usuarios con rol `Chapter Lead`; el registro de una persona no crea automáticamente una cuenta de acceso.
- Aplicar el sistema visual definido en `docs/design-system.md` y respetar la separación entre `apps/web` y `apps/api`.

## Capabilities

### New Capabilities

- `team-members`: Registro y validación de miembros del equipo para su posterior asignación a Squads.

### Modified Capabilities

- Ninguna. Esta propuesta introduce una capacidad nueva y no modifica una especificación principal existente.

## Impact

- **Frontend:** Nueva página responsive con listado, detalle, formulario de alta/edición y acciones de activación/desactivación en Next.js dentro de `apps/web`.
- **Backend:** Endpoints REST de consulta, creación, edición y desactivación lógica de miembros en FastAPI dentro de `apps/api`.
- **Base de datos:** Nueva persistencia para miembros y su vínculo con el catálogo de proveedores y roles profesionales.
- **Autorización:** Validación del rol `Chapter Lead` para operaciones de registro.
- **Pruebas:** Pruebas de validación de API, persistencia, permisos, historial de proveedores y flujo completo del CRUD.
- **Datos existentes:** Los miembros existentes se conservan; la desactivación no elimina registros ni relaciones históricas.
