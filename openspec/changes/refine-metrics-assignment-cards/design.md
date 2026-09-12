## Context

La capacidad existente `metrics-assignment-cards` ya devuelve en el dashboard
los valores necesarios para las cards: rol, proveedor, proyecto, porcentaje y
ambos Squads. En `apps/web/components/metrics-dashboard.tsx`, la card usa un
`dl` con rótulos visibles para los seis datos y la agrupación conserva el orden
en que llegan las asignaciones; el backend actualmente prioriza Squad Asignado,
miembro e identificador.

El orden solicitado es propio de la presentación: al cambiar a la perspectiva
Squad Ejecutor, una misma lista puede reunir asignaciones de distintos Squads
Asignados. Por ello, ordenar únicamente en la consulta del backend no garantiza
el mismo resultado en ambas perspectivas.

## Goals / Non-Goals

**Goals:**

- Reducir la altura visual de las cards eliminando los rótulos visibles de Rol,
  Proveedor y Proyecto sin perder sus valores.
- Mantener una estructura semántica accesible mediante nombres no visibles para
  los valores, cuando sea necesario.
- Ordenar las cards después de agruparlas, con rol, proveedor, miembro e ID como
  criterios deterministas.
- Verificar el resultado en ambas perspectivas y en un viewport móvil.

**Non-Goals:**

- No cambiar el contrato, filtros, agrupaciones, KPIs o reglas de exclusión de
  la API de métricas.
- No cambiar los rótulos de Capacidad o Squad Ejecutor, que no forman parte de
  la solicitud.
- No modificar las cards del módulo `/assignments` ni agregar paginación,
  acciones o dependencias.

## Decisions

### Ocultar solo los rótulos solicitados en la presentación

Se conservarán los elementos de valor de rol, proveedor y proyecto, pero sus
`dt` no se renderizarán como texto visible. La estructura podrá mantener
etiquetas visualmente ocultas (`sr-only`) o equivalentes semánticos para que un
lector de pantalla siga identificando cada valor. Los rótulos de Capacidad y
Squad Ejecutor permanecerán visibles porque el requerimiento solo elimina los
tres rótulos indicados.

**Alternativa considerada:** eliminar por completo los elementos de definición.
Se descarta porque reduce la comprensión para tecnologías asistivas y no aporta
una ventaja necesaria frente a ocultarlos visualmente.

### Ordenar en frontend después de crear los grupos

Se agregará un comparador reutilizable para las cards que use, en este orden:
rol profesional ascendente, proveedor visible ascendente (`Planilla` incluido),
nombre completo ascendente e ID ascendente. El comparador se aplicará a la
colección de cada grupo dentro del mismo `useMemo` que construye los grupos.
Así, el comportamiento es idéntico para Squad Asignado y Squad Ejecutor y no
depende del orden accidental de la respuesta API.

**Alternativa considerada:** cambiar el `sort` de `get_metrics_dashboard` para
ordenar la respuesta global. Se descarta como solución única porque el backend
no conoce la perspectiva visual activa y su orden por Squad Asignado no puede
garantizar el orden interno cuando las cards se reagrupan por Squad Ejecutor.

### Orden de texto estable y sin sensibilidad a mayúsculas

El comparador usará comparación localizada con sensibilidad base para que el
orden dependa del nombre mostrado y no de diferencias de mayúsculas o acentos.
Con los datos de ejemplo, `Data Architect` aparecerá antes que `Data Engineer`.
Los desempates por miembro e ID evitarán cambios de posición entre renders
cuando rol y proveedor coincidan.

### Pruebas orientadas al comportamiento observable

La prueba E2E de métricas ampliará el mock con varios miembros en un mismo grupo,
incluyendo al menos arquitectos e ingenieros y proveedores distintos. Validará
el orden de los encabezados de miembro en el DOM, la presencia de todos los
valores y la ausencia de los tres rótulos como texto visible. También verificará
que al cambiar de perspectiva se mantenga el orden dentro de cada grupo y que
la página no genere overflow horizontal en móvil.

## Risks / Trade-offs

- [Risk] Un nombre de rol o proveedor puede variar por capitalización o acentos
  → Mitigation: comparar con sensibilidad base y usar criterios de desempate
  estables.
- [Risk] Ocultar rótulos puede hacer ambiguos los valores visuales en una card
  muy compacta → Mitigation: conservar la separación visual de metadatos y
  mantener etiquetas semánticas no visibles.
- [Risk] La API puede devolver muchas cards y ordenar en el cliente tiene un
  costo adicional → Mitigation: reutilizar el conjunto ya cargado, ordenar una
  vez por cambio de datos/perspectiva y no introducir una consulta adicional.

## Migration Plan

1. Ajustar el markup y estilos de `AssignmentCard`.
2. Aplicar el comparador a cada grupo de `AssignmentCards`.
3. Actualizar las pruebas E2E y ejecutar typecheck, lint y la prueba de métricas.
4. No se requiere migración de base de datos ni cambio de contrato; el rollback
   consiste en revertir el componente y sus pruebas.
