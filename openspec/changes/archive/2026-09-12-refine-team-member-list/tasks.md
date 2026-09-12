## 1. Contrato paginado y consulta del API

- [x] 1.1 Definir los tipos de consulta y respuesta paginada de miembros (`search`, proveedor, rol, estado, página, tamaño y orden) y verificar que el API rechace parámetros inválidos con una respuesta 422.
- [x] 1.2 Extender el listado de miembros del backend con búsqueda case-insensitive por nombre completo o DNI y filtros combinables por proveedor, rol y estado; verificar filtros aislados y combinados con pruebas unitarias.
- [x] 1.3 Implementar la lista blanca de columnas ordenables, el orden ascendente/descendente, desempate estable por identificador y metadatos `total`, `page`, `page_size` y `total_pages`; verificar paginación y ordenamiento con pytest.
- [x] 1.4 Confirmar que la consulta paginada mantiene la autorización actual y la serialización existente de miembros y afiliaciones; ejecutar la suite de pruebas del API relacionada con miembros.

## 2. Cliente y filtros del frontend

- [x] 2.1 Actualizar los tipos y funciones del cliente API para consumir la respuesta paginada y construir los parámetros de búsqueda, proveedor, rol, estado, paginación y ordenamiento; verificar typecheck.
- [x] 2.2 Incorporar los catálogos de proveedores y roles como filtros visibles, mantener Activos como estado inicial y aplicar debounce a la búsqueda; verificar que los parámetros enviados coincidan con cada combinación de filtros.
- [x] 2.3 Restablecer la página a 1 al cambiar búsqueda, filtros, orden o tamaño de página y conservar los demás parámetros al navegar; verificarlo mediante pruebas Playwright.

## 3. Tabla ordenable y acciones con iconos

- [x] 3.1 Convertir los encabezados de las columnas de datos en controles ordenables con indicador visual y `aria-sort`, dejando Acciones fuera del ordenamiento; verificar alternancia ascendente/descendente y preservación de filtros.
- [x] 3.2 Reemplazar Editar y Desactivar/Reactivar por botones o enlaces de icono SVG con `aria-label`, `title`, foco visible, tamaño táctil y estado disabled durante la mutación; verificar nombres accesibles y navegación de edición.
- [x] 3.3 Conservar la confirmación de desactivación, la reactivación y la actualización del listado sin eliminación física; verificar confirmación, cancelación, cambio de estado y refresco con pruebas Playwright.

## 4. Paginación, estados y responsive

- [x] 4.1 Implementar los controles de paginación con rango mostrado, tamaño de página, página actual y navegación anterior/siguiente; verificar extremos deshabilitados, respuesta vacía y actualización de metadatos.
- [x] 4.2 Mantener estados de carga, error y listado vacío compatibles con filtros y paginación, evitando acciones duplicadas durante solicitudes; verificar cada estado en pruebas de interfaz.
- [x] 4.3 Ajustar el layout mobile-first para que filtros, tabla desplazable y paginación no generen overflow horizontal del documento; verificarlo en el proyecto móvil de Playwright.

## 5. Verificación integral

- [x] 5.1 Ejecutar typecheck, lint y build del frontend y corregir cualquier regresión del contrato paginado.
- [x] 5.2 Ejecutar las pruebas API y E2E del módulo de miembros, incluyendo búsqueda, filtros, ordenamiento, paginación, iconos, desactivación/reactivación y responsive, y confirmar que pasen.
