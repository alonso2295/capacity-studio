## Context

El repositorio parte sin código de aplicación ni capacidades existentes. La
solución debe servir inicialmente a un Chapter Lead que gestiona alrededor de
30 miembros, pero debe conservar la historia de afiliaciones y asignaciones.
La aplicación será interna, con autenticación por email y contraseña, y estará
separada en un frontend Next.js y una API Python conectada a PostgreSQL en
Supabase.

## Goals / Non-Goals

**Goals:**

- Establecer una arquitectura modular que permita evolucionar la aplicación sin
  introducir microservicios prematuramente.
- Mantener una única fuente de verdad para asignaciones, afiliaciones y permisos.
- Validar capacidad acumulada de forma segura durante rangos de fechas solapados.
- Permitir vistas responsive para planificación y consulta.
- Mantener contratos claros entre frontend y backend.

**Non-Goals:**

- Integración con SSO, directorios corporativos o proveedores de identidad externos.
- Automatización de nómina, facturación o contratos comerciales con proveedores.
- Aplicación móvil nativa.
- Notificaciones, aprobaciones formales o integraciones con herramientas de gestión
  de Squads en esta primera base.
- Microservicios, colas de mensajes, Redis o GraphQL para el MVP.

## Decisions

### Arquitectura de despliegue

- Next.js se desplegará en Vercel.
- FastAPI se desplegará como un servicio backend separado; Render es la opción
  inicial por su despliegue directo de servicios Python y puede sustituirse sin
  cambiar el contrato de la aplicación.
- PostgreSQL permanecerá hosteado en Supabase.
- El navegador no accederá directamente a PostgreSQL. Las operaciones de negocio
  pasarán por FastAPI.

### Frontend

- Next.js App Router con TypeScript será la base de navegación y renderizado.
- Tailwind CSS y shadcn/ui proporcionarán componentes consistentes y un diseño
  mobile-first.
- TanStack Query gestionará consultas, caché, estados de carga y mutaciones contra
  la API.
- React Hook Form y Zod se utilizarán para formularios y validación de entrada.
- El cliente TypeScript se derivará del contrato OpenAPI del backend para reducir
  divergencias entre API y frontend.

### Backend y persistencia

- FastAPI expondrá una API REST versionada y documentada mediante OpenAPI.
- Pydantic definirá los esquemas de entrada y salida.
- SQLAlchemy 2.0 será el ORM y Alembic gestionará migraciones versionadas.
- El backend utilizará una conexión apropiada para un servicio persistente de
  Supabase: conexión directa cuando la red lo permita o pooler en modo sesión.
- Las migraciones y operaciones administrativas usarán credenciales de servidor
  fuera del frontend.

### Modelo temporal

- `members` representa a la persona y su estado actual.
- `vendors` representa empresas proveedoras.
- `member_affiliations` representa la relación laboral histórica de un miembro,
  con tipo `PAYROLL` o `CONTRACTOR`, proveedor opcional u obligatorio según el
  tipo, y un rango de vigencia.
- `assignments` representa la relación de un miembro con un Squad durante un
  rango y porcentaje determinados.
- Los rangos usarán una convención de inicio incluido y fin excluido para evitar
  ambigüedad entre periodos contiguos.
- Una asignación no podrá atravesar un cambio de afiliación; el cambio se
  representará dividiéndola en dos asignaciones.
- Las vistas trimestrales serán filtros calculados sobre fechas, no la fuente de
  verdad de una asignación.

### Capacidad y concurrencia

- La API comprobará que cada porcentaje esté entre 0 y 100 y permitirá valores
  decimales, como `12.5%`.
- PostgreSQL almacenará los porcentajes con tipo numérico de precisión fija,
  evitando errores de redondeo propios de tipos de punto flotante.
- Al crear o modificar una asignación, se evaluará la suma de porcentajes en cada
  segmento de tiempo solapado para el miembro.
- La validación de capacidad se reforzará en PostgreSQL mediante una operación
  transaccional segura que serialice cambios concurrentes del mismo miembro.
- Los rangos de afiliación se protegerán contra solapamientos incompatibles. Los
  índices de rango se usarán para consultas temporales.

### Autenticación y autorización

- Supabase Auth gestionará cuentas, contraseñas, sesiones y recuperación de acceso.
- Una cuenta de aplicación se separará del registro de `member`.
- Cada cuenta tendrá exactamente un rol mediante una referencia a `roles`.
- Los permisos se modelarán como combinaciones de módulo y acción, asociadas al
  rol mediante `role_permissions`, para poder agregar roles sin rediseñar las
  tablas de usuarios.
- El alcance se resolverá según el rol: global, proveedor asociado o miembro
  asociado.
- FastAPI aplicará autenticación y autorización en cada endpoint protegido; el
  frontend solo reflejará esos permisos en la experiencia visual.

### Pruebas y calidad

- pytest cubrirá reglas de dominio, autorización y endpoints.
- Playwright cubrirá los flujos principales en escritorio y móvil.
- Ruff, mypy, ESLint y TypeScript strict se ejecutarán en CI.
- Docker Compose proporcionará PostgreSQL local y dependencias de desarrollo
  reproducibles.

## Risks / Trade-offs

- [La suma de capacidades sobre rangos solapados es más compleja que una suma por
  trimestre] -> normalizar rangos, probar segmentos de tiempo y reforzar la regla
  dentro de transacciones serializadas.
- [La autenticación y la API están en servicios separados] -> usar JWT de Supabase
  en las peticiones y pruebas de integración del flujo completo.
- [Los usuarios de proveedor pueden ver información sensible] -> aplicar alcance
  temporal y por proveedor en backend, y excluir campos internos de las respuestas.
- [El historial puede alterarse por ediciones administrativas] -> desactivar en
  lugar de eliminar y registrar actor y timestamps en cambios relevantes.
- [La conexión a Supabase puede agotar conexiones en despliegues escalables] -> usar
  el modo de conexión apropiado, límites conservadores y monitoreo de conexiones.

## Migration Plan

1. Crear el proyecto Supabase y configurar variables de entorno sin incluir secretos
   en el repositorio.
2. Crear el esquema inicial mediante migraciones Alembic.
3. Desplegar la API y verificar conexión, health check y autenticación.
4. Desplegar el frontend en Vercel apuntando a la URL de la API.
5. Ejecutar pruebas de autorización y de capacidad con rangos solapados.
6. Para rollback, desplegar la versión anterior del frontend/API y aplicar solo
   migraciones reversibles previamente verificadas.

## Open Questions

- Los módulos concretos y la matriz detallada de permisos de cada rol se definirán
  en specs específicas posteriores. Este cambio solo establece el modelo extensible
  de roles, permisos y alcances necesario para esas specs.
