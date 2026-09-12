## Context

Capacity Studio ya cuenta con patrones administrativos para proveedores y miembros: el frontend Next.js consume endpoints FastAPI y el backend persiste en PostgreSQL configurado sobre Supabase. No existe todavía una entidad ni una ruta para Squads. La nueva capacidad debe preparar un catálogo estable para futuros procesos de asignación sin incorporar esos procesos en este cambio.

## Goals / Non-Goals

**Goals:**

- Crear un catálogo administrativo de Squads con ciclo de vida activo/inactivo.
- Mantener código y nombre obligatorios, y tribu y PO opcionales.
- Aplicar la misma autorización y experiencia responsive de los catálogos existentes.
- Garantizar unicidad del código tanto en validación de aplicación como en la base de datos.

**Non-Goals:**

- Asignar miembros a Squads o administrar porcentajes, fechas o roles de asignación.
- Crear cuentas de usuario, permisos propios del Squad o relaciones con autenticación.
- Crear catálogos independientes para tribus o POs.
- Implementar importación masiva, auditoría detallada o administración histórica avanzada.

## Decisions

### Modelo de persistencia

Se agregará una entidad `squads` con UUID como identificador, `code`, `name`, `tribe`, `product_owner_name`, `is_active`, `created_at` y `updated_at`. `code` será texto para conservar su naturaleza alfanumérica y tendrá un índice único sobre `lower(code)`. `name` será obligatorio; los campos opcionales admitirán nulo y se normalizarán a nulo cuando lleguen vacíos.

Se usará desactivación lógica mediante `is_active` en lugar de borrar filas. Esto permite que futuras asignaciones o reportes puedan conservar referencias sin perder la identidad del Squad.

**Alternativa descartada:** eliminar físicamente el registro o reutilizar el código al eliminarlo. Se descarta porque rompe la trazabilidad y puede invalidar referencias históricas.

### Contrato de API

El backend expondrá endpoints bajo `/api/v1/squads`:

- `POST /squads` crea un Squad activo.
- `GET /squads?status=active|inactive|all` lista Squads, con `active` como valor predeterminado.
- `GET /squads/{id}` devuelve el detalle, incluso si está inactivo.
- `PATCH /squads/{id}` actualiza datos y permite reactivar con `is_active: true`.
- `DELETE /squads/{id}` establece `is_active: false` sin borrar el registro.

Todos los endpoints administrativos exigirán `Chapter Lead`. Las respuestas no incluirán información de autenticación y los conflictos de código se traducirán a HTTP 409 con un mensaje estable.

**Alternativa descartada:** exponer acceso directo del navegador a Supabase. Se descarta para mantener autorización y reglas de negocio en FastAPI, igual que en proveedores y miembros.

### Validación y normalización

Pydantic validará que el código no esté vacío y contenga solo caracteres alfanuméricos; quitará espacios externos y lo convertirá a mayúsculas. La base de datos protegerá contra carreras entre solicitudes con el índice único insensible a mayúsculas. Los textos se recortarán y los opcionales vacíos se guardarán como nulos.

### Experiencia frontend

Se reutilizarán los patrones visuales del módulo de proveedores: listado con filtro de estado, enlaces a detalle/edición, formulario con React Hook Form y Zod, alertas de carga/error/éxito y confirmación antes de cambiar el estado. La tabla usará un contenedor desplazable para conservar la legibilidad sin provocar desplazamiento horizontal en la página móvil.

## Risks / Trade-offs

- **[Riesgo]** Un código guardado históricamente puede colisionar con otro por diferencias de mayúsculas. → **Mitigación:** normalizar a mayúsculas y aplicar restricción única sobre `lower(code)`.
- **[Riesgo]** Un Squad inactivo podría ser ofrecido por un futuro catálogo de asignaciones. → **Mitigación:** el listado predeterminado y cualquier catálogo posterior deben filtrar `is_active`; esta capacidad documentará el contrato de estado.
- **[Riesgo]** La tribu y el PO como texto libre pueden generar variantes de escritura. → **Mitigación:** mantenerlos opcionales y como texto en esta primera versión; su normalización a catálogos queda fuera de alcance.
- **[Trade-off]** La tabla responsive puede requerir desplazamiento dentro de la tabla en pantallas pequeñas. → **Mitigación:** mantener la página sin overflow horizontal y evaluar tarjetas responsive si el número de columnas aumenta.

## Migration Plan

1. Ejecutar una migración Alembic que cree `squads`, índices y restricciones necesarias.
2. Desplegar FastAPI con los endpoints protegidos por `Chapter Lead`.
3. Desplegar las rutas frontend de listado, detalle, alta y edición.
4. Verificar creación, consulta por estado, edición, unicidad, desactivación y reactivación contra Supabase.

El rollback consiste en retirar las rutas frontend y la versión de API. La migración no debe eliminar otras entidades ni datos; cualquier reversión de `squads` requerirá una migración explícita y segura.
