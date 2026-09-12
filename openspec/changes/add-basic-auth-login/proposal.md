## Why

La aplicación interna necesita estar operativa antes de integrar Supabase Auth, pero no debe quedar expuesta sin protección al publicarse en Vercel y Render. Un login MVP con HTTP Basic Auth permitirá controlar el acceso con una credencial compartida y otorgar el alcance global de `Chapter Lead` mientras se prepara la autenticación definitiva.

## What Changes

- Añadir una pantalla de login en el frontend para capturar usuario y clave.
- Proteger los endpoints funcionales de la API con HTTP Basic Auth.
- Validar la credencial contra `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH`, almacenadas únicamente como variables privadas del backend; conservar solo un hash Argon2 de la contraseña.
- Tratar toda sesión válida como `Chapter Lead`, sin administrar usuarios ni roles individuales.
- Enviar la cabecera `Authorization` desde el frontend a las llamadas de API, incluida la exportación de asignaciones.
- Redirigir a login cuando no exista una credencial válida y manejar respuestas `401`.
- Documentar la configuración separada de Vercel y Render, incluyendo HTTPS, CORS y rotación de credenciales.

## Capabilities

### New Capabilities

- `basic-auth-login`: acceso MVP con usuario y clave, protección de API, sesión de navegador y rol global `Chapter Lead`.

### Modified Capabilities

<!-- No existing capability currently defines authentication requirements. -->

## Impact

- Frontend: nueva ruta y formulario de login; actualización del cliente API y del guard de acceso.
- Backend: autenticación Basic, dependencia de hash de contraseñas, endpoint de verificación y protección de rutas bajo `/api/v1`.
- Configuración: Render conservará `ENVIRONMENT=production`, `FRONTEND_ORIGIN`, `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH` como variables privadas; Vercel recibirá únicamente `NEXT_PUBLIC_API_URL` y no se expondrán secretos con prefijo `NEXT_PUBLIC_`.
- Pruebas: casos de credencial válida, inválida, ausencia de cabecera, rol `Chapter Lead`, navegación protegida y llamadas entre distintos orígenes.
- Alcance futuro: Supabase Auth reemplazará esta credencial compartida; no se implementan todavía cuentas individuales, recuperación de contraseña, auditoría por usuario ni RLS dependiente de identidad.
