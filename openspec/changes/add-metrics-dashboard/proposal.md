## Why

Capacity Studio necesita una vista ejecutiva que permita entender la ocupación de los miembros por trimestre, detectar capacidad disponible y observar cómo evoluciona la composición de roles. Hoy la información está distribuida en listados de miembros y asignaciones, lo que obliga a consolidarla manualmente.

## What Changes

- Crear un módulo de métricas y visualizaciones con selección de año y trimestre.
- Calcular el total de Squads activos con asignaciones en el trimestre seleccionado, usando `Squad Ejecutor` como dimensión de agrupación.
- Mostrar la distribución de miembros por rol profesional en cada Squad Ejecutor del trimestre seleccionado.
- Mostrar la cantidad de miembros activos sin asignación durante el trimestre y permitir abrir un detalle con nombre completo y DNI.
- Mostrar una métrica independiente de miembros con asignaciones marcadas como `Miembro renunció` en el trimestre seleccionado; estas asignaciones no participarán en las agrupaciones operativas.
- Mostrar la cantidad de miembros por proveedor y rol profesional en el trimestre seleccionado.
- Mostrar el total de miembros activos asignados como métrica adicional.
- Considerar una asignación dentro de un trimestre cuando sus fechas se intersecten de forma inclusiva con el rango del trimestre.
- Hacer el módulo visible para cualquier usuario de la aplicación, sin restringirlo al rol `Chapter Lead`.
- Persistir y consultar los datos mediante la API del backend contra PostgreSQL sobre Supabase; el navegador no accederá directamente a la base de datos.

## Capabilities

### New Capabilities

- `metrics-dashboard`: métricas trimestrales, visualizaciones de roles, proveedores, Squads, miembros sin asignación y renuncias.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nueva ruta responsive para filtros trimestrales, tarjetas KPI, distribuciones, modal de miembros sin asignación y navegación de regreso a la página central.
- **Backend:** nuevos esquemas de respuesta y endpoint de métricas que agregará asignaciones, miembros, proveedores, roles y Squads.
- **Base de datos:** no se requieren nuevas tablas; las consultas utilizarán `assignments`, `team_members`, `member_vendor_affiliations`, `vendors`, `professional_roles` y `squads`.
- **Reglas de negocio:** los cálculos operativos excluirán asignaciones con `member_resigned = true`; la métrica de renuncias las contará por separado como miembros únicos.
- **Autorización:** el endpoint no aplicará la restricción `Chapter Lead`; quedará sujeto al acceso general de la aplicación.
- **Pruebas:** trimestres, intersección inclusiva, exclusión de renuncias, miembros únicos, modal de detalle, responsive y estados vacíos.
