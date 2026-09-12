## Context

La aplicación ya tiene una entidad `Vendor` en `apps/api` y la utiliza para
las afiliaciones históricas de miembros tercerizados y para el catálogo de
proveedores activos. Actualmente solo conserva nombre y estado, y no existe un
CRUD de administración. La solución debe convivir con el registro de miembros,
PostgreSQL/Supabase, FastAPI, Next.js y la convención de no borrar entidades
referenciadas históricamente.

## Goals / Non-Goals

**Goals:**

- Ampliar `Vendor` para representar razón social, RUC y datos de contacto.
- Exponer un CRUD administrativo que permita consultar ambos estados y
  desactivar o reactivar sin pérdida histórica.
- Mantener el catálogo usado por miembros restringido a proveedores activos.
- Centralizar validación, normalización y unicidad en el backend y la base de
  datos, con feedback equivalente en el frontend.
- Mantener la entidad de proveedor independiente de cuentas y roles de acceso.

**Non-Goals:**

- Crear cuentas, invitaciones, credenciales o permisos para focal points.
- Implementar administración de usuarios o autorización del módulo.
- Cambiar la lógica de afiliaciones históricas de miembros más allá de impedir
  nuevas afiliaciones a proveedores inactivos.
- Eliminar físicamente proveedores o sus relaciones históricas.

## Decisions

### Extender la entidad existente

Se conservará la tabla `vendors` y se interpretará su columna `name` como razón
social. Se agregarán `ruc`, `focal_point`, `mobile` e `is_active` seguirá siendo
el estado. Mantener `name` evita romper el contrato existente de
`/api/v1/catalogs/vendors`, que devuelve `{id, name}` para el formulario de
miembros. La alternativa de crear una tabla paralela de proveedores duplicaría
la referencia usada por afiliaciones y exigiría una migración de relaciones.

El modelo conservará identificadores estables y timestamps de creación y
actualización. La razón social y el focal point serán no nulos; el celular será
nullable. El RUC será texto no nulo con un índice único insensible a
mayúsculas.

### Contrato de API

El CRUD administrativo se expondrá bajo `/api/v1/providers`:

- `POST /providers`: crea un proveedor activo.
- `GET /providers`: lista proveedores; acepta un filtro de estado y por defecto
  devuelve activos e inactivos para la administración.
- `GET /providers/{id}`: devuelve el detalle, incluso si está inactivo.
- `PATCH /providers/{id}`: actualiza datos o estado con validación completa.
- `DELETE /providers/{id}`: realiza desactivación lógica y no elimina filas.

El endpoint existente `/api/v1/catalogs/vendors` seguirá siendo una vista de
selección y solo devolverá proveedores activos. Las respuestas administrativas
incluirán razón social, RUC, focal point, celular y estado; no incluirán datos
de autenticación porque esa relación no existe en este módulo.

### Normalización y unicidad del RUC

El backend recortará espacios exteriores y convertirá el RUC a mayúsculas antes
de validar y persistirlo. La validación aceptará uno o más caracteres
alfanuméricos y no impondrá una longitud o formato numérico de 11 dígitos,
porque el requisito lo define explícitamente como alfanumérico. La base de
datos tendrá una restricción o índice único sobre la representación normalizada
para protegerse contra carreras entre solicitudes; los conflictos se
traducirán a un error de duplicidad estable.

### Desactivación lógica

La operación DELETE solo cambiará `is_active` a `false`. La reactivación se
realizará mediante PATCH con `is_active: true`. Los registros inactivos seguirán
disponibles en listados administrativos, detalles y consultas históricas, pero
no aparecerán en el catálogo para nuevas afiliaciones. Se elige esta opción
frente al borrado físico porque las afiliaciones de miembros y reportes pueden
referenciar el proveedor.

### Interfaz

La interfaz tendrá una vista de listado con filtro por estado, acción de crear,
acción de editar y confirmación para desactivar o reactivar. El formulario
usará campos con etiquetas visibles y una sola acción primaria; en móvil se
organizará en una columna. El estado se comunicará con texto además de color.
Los mensajes de error se asociarán a los campos y el formulario conservará sus
valores ante errores de red.

### Separación de autenticación

El modelo de proveedor no tendrá `user_id`, contraseña, email de acceso ni rol.
El focal point será únicamente texto de contacto. La integración con la capa
de autenticación/autorización podrá agregarse después mediante una decisión
independiente, sin cambiar la semántica de los datos del proveedor.

## Risks / Trade-offs

- **[Riesgo]** Ya pueden existir filas de `vendors` sin RUC, focal point o
  celular. → **Mitigación:** ejecutar una migración de datos controlada; agregar
  las columnas como temporales si es necesario, resolver los registros
  existentes y luego aplicar las restricciones obligatorias.
- **[Riesgo]** La definición alfanumérica del RUC no especifica longitud ni
  formato fiscal. → **Mitigación:** limitar esta versión a caracteres
  alfanuméricos y dejar una regla fiscal más específica para un cambio futuro.
- **[Riesgo]** El catálogo y el CRUD podrían divergir en sus reglas de estado.
  → **Mitigación:** reutilizar la misma entidad y mantener explícitamente el
  catálogo activo como consulta derivada.
- **[Trade-off]** El listado administrativo devuelve inactivos por defecto
  para facilitar mantenimiento, mientras que los selectores solo consultan
  activos. → **Mitigación:** separar claramente ambos contratos y etiquetar el
  estado en la interfaz.

## Migration Plan

1. Crear una migración Alembic que agregue RUC, focal point y celular a
   `vendors`, incluyendo backfill o procedimiento de resolución para filas
   existentes antes de aplicar `NOT NULL` y la unicidad del RUC.
2. Desplegar los modelos y endpoints de proveedores, conservando el endpoint
   de catálogo activo que utilizan los miembros.
3. Desplegar la interfaz del CRUD y verificar creación, edición, filtrado,
   desactivación, reactivación y rechazo de RUC duplicado.
4. Ejecutar pruebas de regresión del registro de miembros y de sus afiliaciones
   históricas.

El rollback de aplicación consiste en retirar la interfaz y endpoints nuevos.
La migración no debe eliminar filas ni relaciones; cualquier reversión de
esquema requerirá una migración explícita que preserve los datos agregados.
