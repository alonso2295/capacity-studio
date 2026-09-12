## 1. Simplificar el contenido de las cards

- [x] 1.1 Reemplazar el resumen actual de cada asignación por una composición que muestre únicamente nombre completo, rol, proveedor, proyecto, Squad Ejecutor y capacidad asignada; verificar en la vista que no aparezcan DNI, seniority, fechas, estado de renuncia ni Squad Asignado dentro de la card.
- [x] 1.2 Manejar el proveedor nulo mostrando `Planilla` y permitir wrapping de nombres o códigos extensos; verificar que no exista overflow horizontal en viewport móvil.

## 2. Mejorar la presentación visual

- [x] 2.1 Rediseñar la estructura visual de la card con jerarquía para el nombre, metadatos de rol/proveedor, proyecto y Squad Ejecutor separados, y capacidad destacada con texto explícito; verificar consistencia con los tokens del sistema de diseño en escritorio.
- [x] 2.2 Ajustar el layout responsive para apilar cards en móvil y conservar la grilla de escritorio; verificar visualmente la lectura y espaciado en viewports móvil y escritorio.

## 3. Añadir acciones accesibles con iconos

- [x] 3.1 Crear botones de card con iconos SVG inline para editar y eliminar, sin agregar una dependencia externa; verificar que cada botón tenga `aria-label`, `title`, foco visible y tamaño táctil adecuado.
- [x] 3.2 Mantener las acciones textuales de la tabla separadas de las acciones de cards y conectar los iconos con los callbacks existentes; verificar que editar abra la asignación correcta.
- [x] 3.3 Conservar la confirmación antes de eliminar o desactivar y el estado disabled durante la operación; verificar el flujo con mouse y teclado.

## 4. Preservar perspectiva, filtros y cobertura

- [x] 4.1 Mantener las pestañas Squad Asignado/Squad Ejecutor y los encabezados de agrupación, asegurando que al cambiar de perspectiva solo cambien los grupos y que las cards mantengan sus seis campos, incluido Squad Ejecutor; verificar ambas perspectivas.
- [x] 4.2 Actualizar las pruebas Playwright de la vista de cards para validar los seis campos permitidos, incluido Squad Ejecutor, la ausencia de información secundaria, `Planilla`, acciones accesibles y confirmación de eliminación.
- [x] 4.3 Ejecutar las pruebas del frontend y la validación de TypeScript/lint aplicable, verificando que no se introduzcan regresiones en tabla, filtros, paginación u ordenamiento.
