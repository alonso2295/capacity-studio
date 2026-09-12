## Why

Cuando un miembro renuncia durante una asignación, el negocio necesita conservar la asignación original, ajustar manualmente su fecha fin al último día laboral y distinguirla de las asignaciones normales. Sin una marca explícita, no es posible identificar rápidamente estas salidas ni diferenciar el registro original de la asignación independiente del reemplazo.

## What Changes

- Agregar a cada asignación un indicador persistente `Miembro renunció`, desactivado por defecto.
- Permitir activar o desactivar el indicador al crear o editar una asignación, sin cambiar automáticamente la fecha fin; el usuario seguirá registrando el último día laboral mediante el campo existente.
- Mostrar una etiqueta visual de renuncia en la tabla y en las cards.
- Agregar un filtro para consultar únicamente asignaciones cuyo miembro renunció o aquellas que no tienen esa marca.
- Mantener las asignaciones del reemplazo como registros independientes, sin exigir una relación entre la asignación original y la nueva.
- Mantener la regla de capacidad vigente: la asignación marcada seguirá consumiendo porcentaje hasta su `fecha fin` inclusiva.
- Persistir el cambio mediante la API del backend y PostgreSQL sobre Supabase, sin acceso directo del navegador a la base de datos.
- Mantener la administración restringida al rol `Chapter Lead` y conservar el comportamiento actual de CRUD de asignaciones.

## Capabilities

### New Capabilities

- Ninguna. Esta propuesta extiende la capacidad existente de asignaciones.

### Modified Capabilities

- `assignments`: agregar la marca, filtro y representación visual de asignaciones cuyo miembro renunció.

## Impact

- **Base de datos:** nueva columna booleana no nula en `assignments`, con valor por defecto `false`, índice solo si resulta necesario para el filtro.
- **Backend:** actualización de modelos, migración Alembic, esquemas, respuestas, filtros y endpoints existentes de asignaciones.
- **Frontend:** formulario de alta/edición, estado visual en tabla/cards y filtro de renuncia.
- **Reglas de capacidad:** no cambia el cálculo; solo se considerarán las fechas almacenadas, incluyendo la fecha fin.
- **Reemplazos:** no se crea una entidad ni relación adicional; el reemplazo se registra como una nueva asignación independiente.
- **Pruebas:** cobertura de valor por defecto, creación/edición de la marca, filtro, visualización, persistencia tras actualizar fecha fin y coexistencia con una asignación de reemplazo.
