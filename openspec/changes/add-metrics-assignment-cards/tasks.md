## 1. Contrato y consulta de métricas

- [x] 1.1 Agregar los esquemas de opciones de filtros y cards de asignaciones, incluyendo ambos Squads para agrupación y los seis campos visibles; verificar que el contrato Pydantic acepte respuestas con proveedor nulo.
- [x] 1.2 Extender `GET /api/v1/metrics/dashboard` con proveedor, rol y múltiples `assigned_squad_id`, manteniendo año y trimestre como parámetros obligatorios; verificar validación 422 para periodos inválidos.
- [x] 1.3 Implementar la selección inclusiva por trimestre, filtros AND por proveedor/rol/Squad Asignado, exclusión de miembros inactivos y renunciantes, y orden estable de cards; verificar filtros combinados y limpieza con pruebas pytest.
- [x] 1.4 Incluir en la misma respuesta las opciones activas de proveedor, rol y Squad disponibles para usuarios autenticados, sin depender de `require_chapter_lead`; verificar el acceso y la respuesta con pruebas API.
- [x] 1.5 Mantener sin cambios los KPIs, distribuciones y reglas de miembros únicos cuando se aplican filtros operativos de cards; verificar regresión con la suite existente de métricas.

## 2. Cliente y estado de filtros

- [x] 2.1 Actualizar los tipos y la función del cliente de métricas para enviar proveedor, rol y parámetros repetidos de Squad Asignado, y consumir opciones y cards; verificar typecheck.
- [x] 2.2 Incorporar al dashboard el estado de año, trimestre, proveedor, rol y selección múltiple de Squads, incluyendo todos los filtros en la clave de TanStack Query; verificar que cada cambio actualice la consulta.
- [x] 2.3 Implementar un selector accesible de Squad Asignado con checkboxes, limpieza de selección, resumen de cantidad y comportamiento de selección vacía como “todos”; verificar navegación por teclado y selección múltiple con Playwright.

## 3. Cards y perspectivas

- [x] 3.1 Crear la sección de asignaciones del dashboard con estados de carga, error y vacío independientes, y agrupar las cards por Squad Asignado o Squad Ejecutor según la perspectiva activa; verificar ambos agrupamientos con datos mock.
- [x] 3.2 Renderizar cada card únicamente con nombre completo, rol, proveedor, proyecto, capacidad asignada y Squad Ejecutor, mostrando `Planilla` cuando corresponda, sin acciones ni campos adicionales y con un diseño compacto; verificar contenido visible, densidad visual y ausencia de datos no solicitados.
- [x] 3.3 Agregar tabs o botones accesibles para cambiar entre Squad Asignado y Squad Ejecutor sin alterar filtros ni el conjunto de cards; verificar `aria-selected` y persistencia de filtros.
- [x] 3.4 Aplicar el diseño minimalista y responsive, con padding y jerarquía visual compactos, foco visible, lectura accesible del selector/perspectivas y ausencia de overflow horizontal en móvil; verificar con Playwright móvil.

## 4. Verificación integral

- [x] 4.1 Actualizar las pruebas API y E2E del dashboard para cubrir periodo, filtros, múltiples Squads, renuncias excluidas, proveedor Planilla, cards y cambio de perspectiva; verificar que las suites pasen.
- [x] 4.2 Ejecutar pytest, Ruff, typecheck, ESLint y build del frontend; corregir regresiones sin agregar migraciones ni dependencias de gráficos.
