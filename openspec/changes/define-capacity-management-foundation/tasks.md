## 1. Estructura y herramientas del proyecto

- [ ] 1.1 Crear la estructura de workspace para `apps/web`, `apps/api` e `infra`, y verificar que el repositorio tenga una separación clara entre frontend, backend y configuración local
- [ ] 1.2 Configurar Next.js con TypeScript strict, ESLint, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form y Zod, y verificar que la instalación, el lint y el build del frontend completen correctamente
- [ ] 1.3 Configurar el proyecto Python con FastAPI, Pydantic, SQLAlchemy, Alembic, Ruff, mypy y pytest, y verificar que el endpoint de health check y las pruebas base pasen
- [ ] 1.4 Crear Docker Compose para el entorno local y un archivo de variables de entorno de ejemplo sin secretos, y verificar la configuración con `docker compose config`

## 2. Persistencia y modelo temporal

- [ ] 2.1 Crear las migraciones iniciales para miembros, proveedores, Squads, afiliaciones laborales, asignaciones y cuentas de aplicación, y verificar que se apliquen desde una base vacía
- [ ] 2.2 Modelar afiliaciones y asignaciones con rangos de fechas de inicio incluido y fin excluido, y verificar consultas de rangos contiguos y solapados
- [ ] 2.3 Agregar restricciones para que las afiliaciones incompatibles de un miembro no se solapen y para que una afiliación de tercerizado requiera proveedor, y verificar los casos válidos e inválidos con pruebas de base de datos
- [ ] 2.4 Almacenar porcentajes con precisión decimal fija y verificar que valores como `12.5%` se conserven sin pérdida de precisión
- [ ] 2.5 Implementar la validación transaccional de capacidad acumulada por miembro y rangos solapados, y verificar que ninguna combinación confirmada supere el 100%, incluso bajo operaciones concurrentes
- [ ] 2.6 Configurar índices para búsquedas por miembro, proveedor, Squad y rangos de fechas, y verificar mediante pruebas de consulta que los filtros temporales devuelvan los registros esperados

## 3. Autenticación y autorización

- [ ] 3.1 Configurar Supabase Auth para email y contraseña y separar las cuentas de acceso de los miembros del equipo, y verificar inicio de sesión, cierre de sesión y recuperación de acceso en el entorno de prueba
- [ ] 3.2 Crear el catálogo extensible de roles, permisos por módulo y acción, y alcances global, por proveedor y por miembro, y verificar que una cuenta solo pueda tener un rol
- [ ] 3.3 Implementar en FastAPI la validación de sesión y la autorización centralizada por rol y alcance, y verificar respuestas diferenciadas para solicitudes no autenticadas y no autorizadas
- [ ] 3.4 Configurar el alcance de `CHAPTER_LEAD`, `VENDOR_FOCAL` y `TEAM_MEMBER`, y verificar que cada rol solo pueda consultar la información permitida por su ámbito
- [ ] 3.5 Implementar la administración base de usuarios y roles para Chapter Lead sin incluir todavía matrices específicas de módulos futuros, y verificar que un Chapter Lead pueda crear, asignar, desactivar y reactivar cuentas

## 4. Contrato de API y base del frontend

- [ ] 4.1 Crear el contrato REST inicial y el health check del backend, y verificar que la documentación OpenAPI se genere y describa los esquemas de autenticación y errores
- [ ] 4.2 Configurar el cliente de API del frontend con manejo de sesión, errores, estados de carga y caché, y verificar una llamada autenticada de prueba contra el backend
- [ ] 4.3 Crear el layout autenticado responsive y los estados de carga, error, sesión expirada y acceso denegado, y verificar su renderizado en móvil, tableta y escritorio
- [ ] 4.4 Configurar una prueba end-to-end mínima de autenticación y autorización con Playwright, y verificar los flujos de acceso permitido y bloqueado
- [ ] 4.5 Dejar preparada la navegación extensible para módulos futuros sin implementar todavía sus pantallas específicas, y verificar que una ruta protegida respete el rol del usuario

## 5. Calidad, operación y despliegue

- [ ] 5.1 Configurar comandos reproducibles para lint, type checking, pruebas unitarias, pruebas de integración y pruebas end-to-end, y verificar su ejecución local
- [ ] 5.2 Configurar GitHub Actions para ejecutar validaciones del frontend, backend y migraciones, y verificar un pipeline exitoso en una rama de prueba
- [ ] 5.3 Documentar las variables requeridas para Supabase, Vercel y el backend sin incluir secretos, y verificar el arranque del proyecto usando únicamente el archivo de ejemplo como guía
- [ ] 5.4 Configurar los builds de frontend para Vercel y del servicio FastAPI para el proveedor backend elegido, y verificar que ambos builds puedan ejecutarse en un entorno limpio
- [ ] 5.5 Documentar la estrategia de rollback de migraciones y despliegues, y verificar que el procedimiento de recuperación esté versionado junto con el proyecto

## 6. Preparación para módulos posteriores

- [ ] 6.1 Documentar el contrato de extensión para que cada módulo futuro declare sus permisos, endpoints, reglas de alcance y escenarios, y verificarlo con una plantilla de cambio OpenSpec
- [ ] 6.2 Crear datos semilla mínimos para roles y estados de entidades sin fijar permisos de módulos que todavía no tengan una spec específica, y verificar que la inicialización sea idempotente
- [ ] 6.3 Ejecutar una validación integral de la fundación técnica y verificar que `openspec validate --change define-capacity-management-foundation` no reporte errores
