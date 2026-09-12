## Why

El Chapter Lead necesita planificar y mantener la asignación de aproximadamente 30 miembros de Ingeniería de Datos en distintos Squads. La planificación actual requiere considerar miembros de planilla y tercerizados, cambios históricos de proveedor, asignaciones parciales y rangos de fechas que no están limitados a trimestres.

Se necesita una base funcional y técnica clara para construir una aplicación interna responsive que permita consultar y administrar esta capacidad con reglas consistentes y trazabilidad histórica.

## What Changes

- Definir el stack tecnológico y la arquitectura inicial de la aplicación.
- Crear una aplicación web responsive para gestionar miembros, proveedores, Squads y asignaciones.
- Incorporar autenticación interna mediante email y contraseña.
- Separar las cuentas de acceso de los miembros del equipo.
- Definir un único rol por usuario y permisos por módulo y acción.
- Permitir que el Chapter Lead administre usuarios, roles, miembros, proveedores, Squads y asignaciones.
- Permitir que los Focales de Proveedor visualicen únicamente la información de su proveedor durante los periodos correspondientes.
- Permitir que los Miembros de Equipo visualicen sus propias asignaciones.
- Registrar afiliaciones laborales históricas para miembros de planilla y tercerizados.
- Gestionar asignaciones por rangos de fechas y porcentajes de capacidad.
- Impedir que la capacidad total de un miembro supere el 100% en cualquier fecha.
- Ofrecer vistas por rangos personalizados y filtros trimestrales derivados de las fechas de asignación.

## Capabilities

### New Capabilities

- `capacity-management`: Gestiona miembros, proveedores, Squads, afiliaciones, asignaciones temporales, capacidad acumulada, permisos y vistas responsive.

### Modified Capabilities

Ninguna. El repositorio no contiene capacidades existentes.

## Impact

- Se establecerá la arquitectura base con Next.js en Vercel, FastAPI en un servicio backend separado y PostgreSQL en Supabase.
- Se definirán los contratos iniciales entre frontend y backend mediante una API REST documentada con OpenAPI.
- Se incorporarán Supabase Auth, SQLAlchemy, Alembic, pruebas automatizadas, Docker Compose y CI/CD como componentes de la base técnica.
- Se crearán los modelos y restricciones necesarios para conservar historial laboral y validar capacidad sobre rangos de fechas.
- Se establecerán reglas de autorización en el backend para evitar depender únicamente de controles visuales del frontend.
