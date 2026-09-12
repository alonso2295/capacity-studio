## Context

La API actual centraliza la autorización en `apps/api/app/auth.py`, pero permite un bypass local mediante `X-User-Role` y usa JWT en producción. El frontend centraliza sus solicitudes en `apps/web/lib/api.ts` y actualmente no tiene una pantalla ni un estado de sesión. Vercel y Render serán orígenes distintos, por lo que el navegador debe enviar explícitamente la autorización y el backend debe configurar CORS con el origen exacto.

## Goals / Non-Goals

**Goals:**

- Proteger la API desde el backend, incluido el endpoint de exportación.
- Ofrecer un flujo de login usable desde Vercel contra Render.
- Mantener el modelo de autorización existente otorgando siempre `Chapter Lead`.
- Permitir reemplazar este mecanismo por Supabase Auth posteriormente.

**Non-Goals:**

- No crear tablas, cuentas individuales, recuperación de contraseña, logout distribuido ni auditoría por persona.
- No usar cookies compartidas entre Vercel y Render ni convertir el frontend en un proxy BFF.

## Decisions

1. **Basic Auth validado en FastAPI.** Se centralizará la extracción y validación en la dependencia de autenticación existente, usando el esquema estándar `WWW-Authenticate` para los `401`. Se elimina el bypass por cabecera de rol y el fallback que permite acceso sin credenciales. Un endpoint ligero `/api/v1/auth/verify` confirmará la credencial para el formulario.

2. **Hash de contraseña en Render.** Se usarán únicamente `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH`. La contraseña no se almacenará en Git ni en variables `NEXT_PUBLIC_*`; el hash Argon2 se verificará con una librería resistente a ataques offline. El usuario configurado se comparará de forma segura. Se elige hash sobre texto plano para reducir el impacto de una exposición de configuración.

3. **Sesión temporal en `sessionStorage`.** El login codificará la credencial para la cabecera Basic y la guardará solo durante la pestaña. `apps/web/lib/api.ts` la añadirá a todas las solicitudes y limpiará la sesión al recibir `401`. Se elige este mecanismo por su compatibilidad directa con dos dominios y el alcance MVP; HTTPS será obligatorio en producción.

4. **Guard de cliente y backend como autoridad.** El frontend redirigirá visualmente a `/login` cuando no haya sesión, pero cualquier acceso directo seguirá protegido por la API. No se confiará en un rol enviado por el navegador: el backend construirá `CurrentUser` con el username configurado y `Chapter Lead`.

5. **CORS explícito por entorno.** Render permitirá solo `FRONTEND_ORIGIN` (local o URL de Vercel) y conservará `Authorization` entre los headers permitidos. El health check público no requerirá autenticación para que Render pueda supervisar el servicio.

## Risks / Trade-offs

- **[Credencial compartida]** No existe identidad individual ni trazabilidad → limitar el acceso al personal interno, rotar el hash y planificar la migración a Supabase Auth.
- **[sessionStorage accesible por JavaScript]** Un XSS podría leer la sesión → aplicar el design system y controles de seguridad del frontend, usar HTTPS y no persistir en `localStorage`.
- **[Basic Auth en cada solicitud]** La cabecera es reutilizable durante la sesión → TLS obligatorio, mensajes de error sin detalles y no registrar headers.
- **[CORS mal configurado]** Vercel podría no comunicarse con Render → configurar la URL exacta de producción y probar login, consultas y descargas en ambos orígenes.

## Migration Plan

1. Añadir el mecanismo Basic Auth y sus pruebas; verificar localmente con variables de entorno no versionadas.
2. Configurar Render con `ENVIRONMENT=production`, `FRONTEND_ORIGIN`, `APP_AUTH_USERNAME`, `APP_AUTH_PASSWORD_HASH` y health check `/health`. El hash Argon2 se generará fuera del repositorio.
3. Configurar Vercel con `NEXT_PUBLIC_API_URL` apuntando a Render y validar el flujo completo sobre HTTPS.
4. Si se requiere rollback, redeplegar la versión anterior solo dentro de una red controlada; no dejar producción sin autenticación. Más adelante, sustituir la dependencia de Basic Auth por Supabase Auth y eliminar el almacenamiento de credenciales del navegador.
