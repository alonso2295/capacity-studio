## Context

La capacidad `assignments` ya persiste una fila por asignación, permite editar el rango de fechas y calcula la capacidad sobre rangos inclusivos. La respuesta enriquecida se consume tanto en la tabla como en las cards, mientras que el backend mantiene la autorización de `Chapter Lead` para el CRUD. Ver `proposal.md` y la especificación de esta change para el comportamiento esperado.

## Goals / Non-Goals

**Goals:**

- Persistir el indicador de renuncia por asignación con compatibilidad para datos existentes.
- Exponer el indicador en creación, edición, consulta y filtro sin alterar la semántica actual de fechas y capacidad.
- Hacer visible la marca en tabla y cards, manteniendo los filtros compartidos y la composición minimalista existente.
- Permitir que un reemplazo se registre como una asignación normal e independiente.

**Non-Goals:**

- No cambiar el estado activo del miembro automáticamente.
- No actualizar automáticamente la fecha fin al activar la marca; el último día laboral lo ingresará el usuario.
- No crear una relación, flujo de contratación o entidad especial para el reemplazo.
- No cambiar las reglas de porcentaje, solapamiento, proveedor capturado, Squads o autorización.

## Decisions

### Modelo y migración

Agregar `member_resigned` a `Assignment` como booleano `NOT NULL` con valor por defecto `false`. La migración debe backfillear los registros existentes con `false` y conservar la compatibilidad con despliegues donde ya existan asignaciones. No se requiere una fecha de renuncia separada porque el requerimiento identifica el evento mediante la marca y usa `end_date` para el último día laboral.

**Alternativa descartada:** guardar el estado en `TeamMember`. Se descarta porque una misma persona puede tener varias asignaciones y la renuncia aplica al registro de servicio concreto, no necesariamente a todas sus asignaciones.

### Contrato de API

Extender `AssignmentCreate`, `AssignmentUpdate` y `AssignmentResponse` con `member_resigned`. El alta usará `false` cuando el cliente omita el campo; la actualización lo tratará como opcional para conservar el valor existente en PATCH parcial. Extender `GET /api/v1/assignments` con `member_resigned: bool | None`; `None` no filtra y `true`/`false` filtran por igualdad. Las rutas conservarán `require_chapter_lead` y no se agregará un endpoint separado.

### Capacidad y reemplazos

La validación de capacidad continuará usando únicamente `start_date`, `end_date` y `allocation_percentage`. Marcar una asignación no la excluye: solo cambiar la fecha fin reduce el consumo después del nuevo límite inclusivo. El reemplazo usa el POST existente y puede ser creado con cualquier miembro activo, sujeto a la misma validación de capacidad.

**Alternativa descartada:** descontar automáticamente la asignación al marcarla. Se descarta porque podría ocultar capacidad vigente si el usuario todavía no ha registrado el último día laboral real.

### Frontend

Agregar el campo al tipo `Assignment`, `AssignmentFormValues` y las funciones de API. En el modal se mostrará como un checkbox o switch etiquetado `Miembro renunció`, disponible en alta y edición, con valor inicial `false` en alta y el valor persistido en edición. Se agregará un filtro con las opciones `Todas`, `Miembro renunció` y `Miembro activo en la asignación`.

La tabla mostrará una columna o badge de estado de renuncia y las cards mostrarán un badge compacto dentro del contenido de la card. La marca no alterará la agrupación por Squad ni las subpestañas, y los nombres de los Squads permanecerán fuera del contenido de las cards conforme al cambio anterior.

### Verificación

Cubrir el default de la migración y esquemas, creación/edición/parcial de la marca, filtros combinados, autorización, ajuste de fecha fin, capacidad inclusiva y registro independiente de reemplazo. En Playwright verificar el checkbox, badge en tabla/cards y persistencia del filtro al cambiar de vista.

## Risks / Trade-offs

- **[Riesgo]** Un usuario puede marcar la renuncia y olvidar ajustar la fecha fin. → **Mitigación:** no automatizar una fecha desconocida, mostrar la fecha fin en el formulario y cubrir el flujo documentado en las pruebas.
- **[Riesgo]** El indicador podría confundirse con la baja del miembro. → **Mitigación:** etiquetarlo explícitamente como `Miembro renunció` y mantenerlo como atributo de la asignación, sin tocar `TeamMember.is_active`.
- **[Riesgo]** El filtro booleano puede ocultar asignaciones históricas si se aplica accidentalmente. → **Mitigación:** iniciar siempre en `Todas` y conservar la opción explícita para limpiar el filtro.
- **[Trade-off]** No habrá trazabilidad de quién ni cuándo activó la marca. → **Mitigación:** dejar auditoría detallada fuera de esta change; los timestamps de actualización existentes continuarán registrando el último cambio de la fila.

## Migration Plan

1. Crear y aplicar la migración Alembic que agrega `member_resigned` con default `false` a `assignments` en Supabase.
2. Desplegar backend con esquemas, filtro y respuesta compatibles con clientes que aún no envían el campo.
3. Desplegar frontend con checkbox, badges y filtro.
4. Verificar datos existentes, autorización, capacidad, creación del reemplazo y pruebas automatizadas.

El rollback de aplicación puede omitir el campo en el cliente, pero la reversión de la migración requiere respaldo y coordinación si ya existen asignaciones marcadas. No se eliminarán datos de miembros ni asignaciones durante el rollback.
