## 1. Configuración y autenticación del backend

- [x] 1.1 Añadir la dependencia de Argon2 y documentar `APP_AUTH_USERNAME` y `APP_AUTH_PASSWORD_HASH` en el ejemplo de entorno; verificar que la instalación y el arranque fallen claramente si faltan variables en producción.
- [x] 1.2 Reemplazar el bypass de `X-User-Role` y el fallback sin credenciales de `apps/api/app/auth.py` por validación HTTP Basic contra la configuración privada; verificar que ningún rol enviado por el cliente altere el usuario autenticado.
- [x] 1.3 Mantener `require_chapter_lead` como autorización global para la credencial válida y crear `GET /api/v1/auth/verify`; verificar respuestas `200` con `Chapter Lead` y `401` con `WWW-Authenticate: Basic`.
- [x] 1.4 Ajustar CORS y la configuración de producción para aceptar `Authorization` únicamente desde `FRONTEND_ORIGIN`, manteniendo `/health` público; verificar una solicitud desde `http://localhost:3000` y otra desde el origen configurado.

## 2. Flujo de login del frontend

- [x] 2.1 Crear la ruta `/login` siguiendo `docs/design-system.md`, con campos de usuario y clave, estado de carga y error genérico; verificar validación visual y navegación con Playwright.
- [x] 2.2 Añadir el estado de sesión temporal en `sessionStorage`, verificar la credencial contra `/api/v1/auth/verify` y redirigir al módulo principal tras éxito; verificar que una clave inválida no se persista.
- [x] 2.3 Proteger la navegación del frontend cuando no haya sesión y limpiar `sessionStorage` ante un `401`; verificar acceso directo a una ruta protegida, reautenticación y cierre por rechazo del backend.

## 3. Integración del cliente API

- [x] 3.1 Actualizar `apps/web/lib/api.ts` para enviar `Authorization: Basic ...` en consultas, mutaciones y descarga de Excel sin leer secretos desde `NEXT_PUBLIC_*`; verificar los headers con pruebas unitarias o de integración.
- [x] 3.2 Configurar `NEXT_PUBLIC_API_URL` para el backend remoto y conservar compatibilidad local; verificar desde el navegador que las consultas y la exportación funcionen entre Vercel y Render.

## 4. Calidad y despliegue

- [x] 4.1 Añadir pruebas backend para credenciales válidas, inválidas, ausentes, rol fijo y rutas protegidas; verificar con `pytest` y las comprobaciones Ruff/mypy del proyecto.
- [x] 4.2 Añadir pruebas frontend para login, guard, manejo de `401` y exportación autenticada; verificar con `npm run lint`, `npm run typecheck` y `npm run test:e2e`.
- [ ] 4.3 Documentar el despliegue: variables privadas y health check en Render, URL pública en Vercel, HTTPS obligatorio y rotación del hash; verificar el flujo completo en el entorno publicado sin exponer credenciales en GitHub.
