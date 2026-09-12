## Context

El frontend consume la API REST y el listado actual de asignaciones ya centraliza filtros, paginación, ordenamiento y datos enriquecidos como nombres de proveedor, rol y Squad. La exportación debe consultar el conjunto completo filtrado, no reutilizar únicamente la página cargada en la tabla. Ver proposal.md - Why y specs/assignment-export/spec.md para la motivación y el contrato funcional.

## Goals / Non-Goals

**Goals:**

- Entregar un archivo XLSX generado con datos autorizados y filtros equivalentes al listado.
- Mantener una única fuente de verdad para la consulta y el mapeo de asignaciones.
- Hacer que el archivo sea legible en Excel, con encabezados estables, fechas reconocibles y porcentajes utilizables.
- Integrar la descarga en la vista tabla y conservar la experiencia actual de filtros, cards, paginación y edición.

**Non-Goals:**

- No modificar el modelo de datos, las migraciones ni las reglas de capacidad.
- No exportar columnas no solicitadas, incluido Squad Ejecutor, seniority, estado de renuncia o acciones.
- No convertir la exportación en un reporte configurable ni agregar selección manual de columnas.

## Decisions

### Endpoint dedicado de exportación

Agregar una ruta GET dedicada para exportación bajo el recurso de asignaciones, antes de las rutas por identificador. Recibirá los filtros del listado y devolverá el XLSX como descarga con Content-Disposition. La consulta no recibirá page ni page_size; usará la misma autorización, joins, filtros y valores derivados que el listado, y podrá conservar el ordenamiento activo para que el archivo siga el contexto de la tabla.

**Alternativa considerada:** descargar los datos desde el navegador usando los elementos ya cargados. Se descarta porque la tabla está paginada y produciría archivos incompletos.

### Generación del XLSX en el backend

Incorporar una biblioteca Python de generación de XLSX, preferentemente openpyxl, como dependencia de producción del API. Construir el libro en memoria, escribir una única hoja de nombre Asignaciones y devolverlo como respuesta binaria. Las fechas se escribirán como valores de fecha con formato yyyy-mm-dd; el porcentaje conservará su valor numérico con formato visible de porcentaje. El caso sin resultados generará solo la fila de encabezados.

**Alternativa considerada:** generar el archivo con una biblioteca JavaScript en el frontend. Se descarta para evitar duplicar la consulta, exponer datos fuera del flujo autorizado del API y depender del tamaño de la página.

### Contrato de columnas

El mapeo se definirá en una lista ordenada única, con los encabezados DNI, Nombre Completo, Proveedor, Rol, Squad Asignado, Proyecto, Fecha Inicio, Fecha Fin y % asignado. Proveedor aplicará el fallback Planilla. Rol usará professional_role_name y Squad Asignado usará assigned_squad_name.

### Integración de interfaz

Añadir un botón Descargar Excel en la sección de filtros o encabezado del listado. La función del cliente serializará los filtros actuales y el ordenamiento activo, solicitará el blob, respetará el nombre recibido o uno generado para asignaciones y disparará la descarga sin navegar fuera de la página. El estado de la solicitud será local al módulo para no invalidar ni reemplazar la query del listado.

## Risks / Trade-offs

- [Dataset grande] → La generación en memoria puede elevar el consumo del API; reutilizar una consulta acotada por filtros, aplicar límites razonables de tiempo de solicitud y revisar el tamaño real durante las pruebas.
- [Diferencia entre tabla y archivo] → Centralizar filtros y el mapeo en el backend y probar cada filtro contra la exportación.
- [Compatibilidad de Excel] → Usar XLSX estándar, tipos de celda nativos y encabezados simples; verificar apertura y valores con pruebas automatizadas.
- [Permisos] → Proteger la nueva ruta con el mismo dependency de autenticación y autorización que GET /assignments.

## Migration Plan

1. Añadir la dependencia y el endpoint del API, junto con pruebas de contenido, filtros, autorización y respuesta vacía.
2. Añadir el cliente de descarga y el botón con estados accesibles.
3. Añadir pruebas E2E de descarga filtrada y ejecutar las verificaciones de calidad existentes.
4. Desplegar API y frontend coordinadamente; no requiere migración de base de datos. Para revertir, retirar el botón y la ruta, sin cambios de esquema.
