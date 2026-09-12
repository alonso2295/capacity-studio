## Context

La propuesta agrega un flujo completo de alta y administración de miembros a una aplicación todavía en fase de fundación. La arquitectura acordada separa el frontend Next.js en `apps/web` del backend FastAPI en `apps/api`; el backend concentra autorización, validación y reglas de negocio, y PostgreSQL en Supabase conserva los datos.

El módulo debe convivir con el modelo de acceso ya definido: una persona puede tener una sola cuenta y un solo rol de aplicación, mientras que el `Rol profesional` del miembro es un dato de negocio independiente.

## Goals / Non-Goals

**Goals:**

- Proveer un flujo responsive de registro, consulta y edición para Chapter Leads.
- Permitir desactivar y reactivar miembros sin eliminar físicamente sus registros.
- Mantener datos de miembro, cuenta de acceso, proveedor y rol profesional como conceptos separados.
- Conservar el historial de afiliaciones con proveedores cuando estas cambien.
- Aplicar validación consistente en frontend y backend, con el backend como autoridad final.

**Non-Goals:**

- Crear cuentas, contraseñas o invitaciones de acceso al registrar un miembro.
- Implementar importación masiva de miembros.
- Implementar una pantalla independiente para administrar manualmente rangos históricos de afiliaciones.
- Implementar la asignación de miembros a Squads.
- Definir la administración del catálogo de roles profesionales.

## Decisions

### Separación de responsabilidades entre aplicaciones

La página de administración y sus componentes vivirán en `apps/web`. El listado y los formularios consumirán una API REST de `apps/api`; no accederán directamente a Supabase. FastAPI verificará la sesión y el rol `Chapter Lead`, repetirá las validaciones críticas y devolverá errores estructurados para que el frontend los asocie a los campos.

Se elige esta frontera porque evita exponer credenciales de base de datos y centraliza las reglas que también necesitarán los futuros módulos de asignaciones. No se implementará lógica de autorización únicamente en la interfaz.

### Modelo de persistencia

Se agregará una entidad `team_members` con identificador UUID, datos personales, contacto, fecha de nacimiento, tipo de vínculo, rol profesional, seniority, estado y timestamps. DNI y correo tendrán restricciones de unicidad, con el correo comparado de forma insensible a mayúsculas.

Los roles profesionales se referenciarán desde un catálogo de roles activos. La cuenta de Supabase Auth y la tabla de perfiles de acceso no se mezclarán con `team_members`.

Para tercerizados se usará una relación de afiliaciones miembro-proveedor con un rango de vigencia. El registro inicial creará la afiliación vigente desde la fecha de alta hasta una fecha abierta; un futuro cambio cerrará ese rango y creará otro, sin sobrescribir el historial. Para planilla no se creará afiliación a proveedor.

Se elige una tabla de afiliaciones en lugar de guardar solamente `provider_id` en el miembro porque el proveedor puede cambiar con el tiempo y las asignaciones futuras deben poder interpretarse históricamente.

### Experiencia de administración

La página mostrará un listado con filtros por estado, acceso al detalle y acciones contextuales para editar, desactivar o reactivar. El alta y la edición usarán las secciones `Datos personales`, `Contacto` y `Vínculo y perfil`. Usará los patrones de `docs/design-system.md`: campos con etiquetas visibles, ayuda contextual cuando aplique, mensajes de error junto al campo y un CTA primario de guardado.

- DNI será un campo de texto con entrada numérica en dispositivos móviles y validación del formato local.
- Fecha de nacimiento será un selector de fecha y se enviará como fecha ISO; no se aceptarán fechas futuras.
- Tipo de vínculo será un selector con `Planilla` y `Tercerizado`.
- Proveedor será un combobox de proveedores activos, visible y obligatorio solo para `Tercerizado`.
- Rol profesional será un combobox de roles activos del catálogo, sin reutilizar el selector de roles de autorización.
- Seniority será un selector con `Medium` y `Senior`.

La validación de interacción se realizará en el cliente para feedback inmediato y se repetirá en la API para garantizar consistencia. Tras un error de red, el formulario conservará los valores ingresados y bloqueará el botón mientras la solicitud esté en curso.

### Contrato de API

El backend expondrá endpoints versionados bajo `/api/v1/members`:

- `POST /members` creará un miembro activo y, si corresponde, su afiliación vigente inicial.
- `GET /members?status=active|inactive|all` devolverá el listado filtrable; el valor predeterminado será `active`.
- `GET /members/{id}` devolverá el detalle del miembro, su estado y el historial de afiliaciones.
- `PATCH /members/{id}` actualizará los datos o el estado del miembro y gestionará cambios de proveedor conservando el historial.
- `DELETE /members/{id}` realizará una desactivación lógica; no eliminará físicamente el miembro ni sus afiliaciones.

Las respuestas exitosas devolverán el identificador y una representación segura del registro, sin secretos ni información de autenticación. Los errores de campos usarán una estructura estable para que el frontend pueda mostrarlos sin interpretar mensajes internos. Los miembros inactivos no podrán utilizarse en nuevas asignaciones.

### Edición e historial de afiliaciones

La edición conservará el identificador del miembro y aplicará las mismas reglas de validación, normalización, catálogos y unicidad del alta. Cuando cambie el proveedor de un miembro tercerizado, la API cerrará la afiliación vigente y creará una nueva con su fecha de inicio. Al cambiar a `Planilla`, cerrará la afiliación vigente sin borrar el historial. La consulta de detalle expondrá estas relaciones en orden temporal.

## Risks / Trade-offs

- **[Riesgo]** La ausencia de una fecha explícita de inicio en el formulario puede no representar correctamente una afiliación histórica cargada con retraso. → **Mitigación:** usar la fecha de alta como inicio predeterminado y dejar la corrección histórica para un módulo posterior de afiliaciones.
- **[Riesgo]** La lista de roles profesionales puede no estar disponible al abrir el formulario. → **Mitigación:** cargarla desde un catálogo activo, mostrar estado de carga/vacío y bloquear el guardado hasta contar con una selección válida.
- **[Riesgo]** Validar duplicados solo en el frontend permite carreras entre solicitudes. → **Mitigación:** aplicar restricciones únicas en PostgreSQL y traducir los conflictos a errores de dominio.
- **[Riesgo]** Una desactivación lógica puede permitir que otro módulo use miembros inactivos por error. → **Mitigación:** exponer solo miembros activos en catálogos de asignación y validar el estado también en el backend.
- **[Riesgo]** Un cambio de proveedor mal aplicado puede sobrescribir la trazabilidad histórica. → **Mitigación:** cerrar la afiliación vigente y crear una nueva dentro de una transacción, sin actualizar destructivamente la relación anterior.
- **[Trade-off]** Se incluyen reglas de validación duplicadas en frontend y backend para mejorar la experiencia, a costa de mantener dos capas. → **Mitigación:** documentar el contrato de campos y mantener la API como fuente de verdad.

## Migration Plan

1. Ejecutar la migración Alembic que crea `team_members`, el catálogo de roles profesionales si aún no existe y las afiliaciones miembro-proveedor, incluyendo índices y restricciones de unicidad.
2. Desplegar la API con los endpoints CRUD protegidos por rol y la regla de desactivación lógica.
3. Desplegar la página frontend con listado, detalle, alta, edición y acciones de estado apuntando a la API.
4. Verificar con un usuario Chapter Lead el CRUD completo, la conservación del historial y el rechazo a roles no autorizados.

El rollback consiste en retirar la ruta frontend y desplegar la versión anterior de la API. La migración no debe eliminar tablas ni datos; cualquier reversión de esquema se hará mediante una migración explícita y segura.
