## Purpose

Proporcionar un acceso MVP sencillo y controlado para la aplicación interna mientras la autenticación individual con Supabase Auth permanece fuera de alcance.

## ADDED Requirements

### Requirement: API validates the shared Basic Auth credential

La API SHALL exigir HTTP Basic Auth para todas las rutas funcionales bajo `/api/v1`, incluyendo la exportación de asignaciones. La credencial válida SHALL provenir de configuración privada del backend y la API SHALL responder `401 Unauthorized` con el desafío Basic cuando la cabecera falte o sea inválida. El endpoint público de salud SHALL permanecer disponible para las comprobaciones de despliegue.

#### Scenario: Valid credential accesses a protected endpoint

- **WHEN** una solicitud a una ruta funcional de `/api/v1` incluye el usuario y la clave configurados
- **THEN** la API procesa la solicitud y no expone la credencial en la respuesta ni en los logs de aplicación

#### Scenario: Missing or invalid credential is rejected

- **WHEN** una solicitud a una ruta funcional de `/api/v1` no incluye Basic Auth o incluye datos incorrectos
- **THEN** la API responde `401 Unauthorized` con `WWW-Authenticate: Basic` y no ejecuta la operación

### Requirement: Authenticated requests have global Chapter Lead access

Toda credencial válida SHALL representar a un usuario con rol exacto `Chapter Lead` y alcance global. El sistema SHALL permitirle consultar y modificar todas las funcionalidades actualmente autorizadas para ese rol, sin crear registros de usuarios ni roles adicionales.

#### Scenario: Valid credential verifies the role

- **WHEN** el usuario autenticado consulta el endpoint de verificación de `/api/v1`
- **THEN** la API responde éxito e indica el rol `Chapter Lead`

#### Scenario: Invalid role cannot be supplied by the client

- **WHEN** el cliente envía un rol en una cabecera, parámetro o payload
- **THEN** la API ignora ese valor y conserva el rol derivado de la credencial configurada

### Requirement: Frontend provides a session login flow

El frontend SHALL mostrar una pantalla de login cuando no exista una credencial válida en la sesión del navegador. Tras una verificación exitosa SHALL conservar la credencial solo en `sessionStorage` de esa pestaña y redirigir a la aplicación; ante un `401` SHALL eliminarla y devolver al usuario al login mostrando un mensaje accionable.

#### Scenario: User logs in successfully

- **WHEN** el usuario envía el formulario con la credencial válida
- **THEN** el frontend verifica la API, guarda la sesión de forma temporal y muestra las funcionalidades protegidas

#### Scenario: User submits invalid credentials

- **WHEN** el usuario envía un usuario o clave inválidos
- **THEN** el frontend conserva la pantalla de login, no guarda la credencial y muestra un error sin revelar cuál campo falló

### Requirement: Frontend sends credentials to the Render API

El cliente API SHALL enviar la cabecera `Authorization: Basic ...` en cada solicitud protegida, incluyendo descargas, usando la URL configurada para el backend. La configuración SHALL permitir orígenes separados entre Vercel y Render y SHALL requerir HTTPS en producción. Ninguna credencial SHALL utilizar variables `NEXT_PUBLIC_*` ni quedar incorporada al bundle público.

#### Scenario: Protected browser request crosses origins

- **WHEN** una sesión autenticada desde el dominio de Vercel solicita datos o descarga un archivo desde Render
- **THEN** la solicitud incluye Basic Auth, Render acepta únicamente el origen frontend configurado y la respuesta se procesa correctamente

#### Scenario: Session ends or backend rejects access

- **WHEN** una solicitud del frontend recibe `401 Unauthorized`
- **THEN** el cliente elimina la credencial de `sessionStorage` y solicita nuevamente el login

### Requirement: Deployment configuration keeps the shared credential private

El despliegue SHALL documentar `ENVIRONMENT=production`, `FRONTEND_ORIGIN`, `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH` como variables privadas del servicio backend en Render, y la URL pública del backend como variable del frontend en Vercel. `APP_AUTH_PASSWORD_HASH` SHALL contener un hash Argon2, nunca la contraseña en texto plano. El sistema SHALL fallar de forma segura si falta cualquiera de las variables de autenticación en producción y SHALL recomendar rotación de la credencial compartida.

#### Scenario: Production starts without auth configuration

- **WHEN** el backend intenta iniciar en un entorno de producción sin usuario o hash configurados
- **THEN** el proceso falla con un mensaje de configuración claro y no inicia una API sin protección

#### Scenario: Deployment uses separate environment variables

- **WHEN** se configura Vercel y Render para producción
- **THEN** Vercel recibe únicamente la URL del backend y Render conserva el usuario, hash, origen permitido y demás secretos como variables privadas
