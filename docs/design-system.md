# Capacity Studio — Design System

Fuente de referencia visual y de interacción para todas las páginas del frontend.
Las specs de módulos deben cumplir esta guía y documentar cualquier excepción.

## 1. Principios

- Clara: la interfaz debe priorizar comprensión y reducir carga cognitiva.
- Humana: el lenguaje y los estados deben orientar sin culpar al usuario.
- Confiable: cada acción debe comunicar su estado y resultado.
- Profesional: los componentes deben ser consistentes y sobrios.
- Inquieta e innovadora: usar énfasis visual con intención, sin saturar la pantalla.
- Responsive por defecto: diseñar primero para móvil y ampliar progresivamente.

## 2. Paleta

### Marca

| Token | Valor | Uso |
|---|---|---|
| `brand-cyan` | `#0099CC` | Identidad, enlaces, navegación activa, indicadores y acentos |
| `brand-magenta` | `#EE2C70` | Énfasis secundario, estados destacados y categorías especiales |
| `brand-cyan-700` | `#007AA3` | Texto, bordes y fondos de acción cuando se necesita mayor contraste |
| `brand-magenta-700` | `#C51F59` | Texto o controles magenta que necesiten mayor contraste |

### Superficies y texto

| Token | Valor | Uso |
|---|---|---|
| `surface` | `#FFFFFF` | Tarjetas, formularios y superficies principales |
| `canvas` | `#F6F9FB` | Fondo general de la aplicación |
| `surface-muted` | `#EEF4F7` | Fondos informativos y secciones secundarias |
| `text-primary` | `#16324F` | Títulos y contenido principal |
| `text-secondary` | `#526575` | Ayuda, metadatos y contenido secundario |
| `text-disabled` | `#8A9AA6` | Controles y texto deshabilitado |
| `border` | `#D7E2E8` | Bordes y divisores |
| `focus-ring` | `#006F98` | Indicador visible de foco |

### Estados semánticos

| Token | Valor | Uso |
|---|---|---|
| `success` | `#16803C` | Confirmación, cumplimiento y operación exitosa |
| `warning` | `#A15C00` | Advertencia, revisión y atención |
| `danger` | `#B42318` | Error, eliminación y riesgo irreversible |
| `info` | `#0B6E99` | Información y orientación |
| `special` | `#6B46C1` | Categorías especiales, gobierno o arquitectura |

El color nunca debe ser la única forma de comunicar un estado. Combinar color
con texto, iconografía o una marca visual adicional.

## 3. Tipografía

Usar una fuente sans-serif moderna y legible. Preferencia: Inter; alternativa:
`Segoe UI`, Arial o `sans-serif`.

| Elemento | Tamaño | Peso | Uso |
|---|---:|---:|---|
| Título de página | 28–36 px | 700 | Una sola vez por página |
| Título de sección | 20–24 px | 600–700 | Agrupa contenido |
| Título de tarjeta | 15–18 px | 600 | Identifica una tarjeta |
| Texto principal | 14–16 px | 400 | Contenido y controles |
| Texto secundario | 12–14 px | 400 | Ayuda y metadatos |
| Label | 12–14 px | 600 | Nunca ocultar como único identificador |
| KPI | 28–36 px | 700 | Valores destacados |

Usar sentence case en títulos y labels. Reservar mayúsculas para códigos,
estados breves o casos donde aporten una distinción clara.

## 4. Espaciado y forma

Usar una escala base de 4 px, con preferencia por múltiplos de 8 px:

```text
4   8   12   16   24   32   40   48   64
```

- Separación entre label y control: 6–8 px.
- Separación entre campos: 16 px.
- Separación entre grupos de formulario: 24–32 px.
- Padding de tarjeta: 20–24 px en escritorio, 16 px en móvil.
- Radio de controles: 8 px.
- Radio de tarjetas: 12 px.
- Bordes: 1 px, evitando sombras fuertes.
- Sombra: ligera, solo para elevar modales, dropdowns y superficies flotantes.

## 5. Formularios

### Estructura

Cada campo debe seguir esta estructura:

```text
Label [opcional: requerido]
Control
Texto de ayuda [opcional]
Mensaje de error [si aplica]
```

Reglas:

- Todo control debe tener label visible.
- Los campos obligatorios deben indicarse antes del envío.
- El placeholder no reemplaza al label.
- Los textos de ayuda explican formato, alcance o consecuencia.
- Los errores indican qué ocurrió y cómo corregirlo.
- El formulario debe agrupar campos relacionados bajo un título de sección.
- No usar más de dos columnas salvo que el patrón sea claramente repetitivo.
- Las acciones principales deben estar al final del formulario.

### Dimensiones

- Altura mínima de input, select y botón: 40 px; preferencia táctil de 44 px.
- Label: 12–14 px, peso 600.
- Texto de ayuda y error: 12–14 px.
- Input de texto: ancho completo del contenedor.
- Formulario estándar: ancho máximo recomendado de 640–720 px.
- Formulario complejo: ancho máximo recomendado de 960 px.

### Estados de campos

| Estado | Tratamiento |
|---|---|
| Default | Fondo blanco, borde `border`, texto `text-primary` |
| Hover | Borde ligeramente más contrastado |
| Focus | Borde `focus-ring` y anillo visible, sin depender solo de color |
| Error | Borde y mensaje `danger`, icono opcional, texto correctivo |
| Disabled | Fondo `surface-muted`, texto `text-disabled`, cursor no disponible |
| Read-only | Legible y distinguible de editable, sin parecer deshabilitado |
| Loading | Indicador de progreso y bloqueo de envío duplicado |
| Success | Confirmación breve sin desplazar inesperadamente el formulario |

### Formularios de asignación

Los campos de asignación deben priorizar:

- Miembro.
- Squad.
- Fecha inicial.
- Fecha final.
- Porcentaje de capacidad.
- Rol o función.
- Notas, si corresponde.

El porcentaje debe mostrar el símbolo `%` sin confundirlo con texto libre. La
capacidad disponible y los conflictos de solapamiento deben mostrarse cerca del
campo correspondiente y también en un resumen antes de guardar.

## 6. Botones y acciones

### Acción primaria

- Fondo `brand-cyan-700` o derivado accesible del cian de marca.
- Texto blanco.
- Una acción primaria por contexto principal.
- Ejemplos: `Guardar asignación`, `Crear miembro`.

### Acción secundaria

- Fondo blanco o transparente.
- Borde y texto cian accesible.
- Ejemplos: `Cancelar`, `Limpiar filtros`.

### Acción crítica

- Usar `danger` para eliminación o riesgo irreversible.
- Usar magenta solo como énfasis auxiliar, no como sustituto automático de error.
- Requerir confirmación para acciones irreversibles.

Todos los botones deben tener estados hover, active, disabled y loading. Las
etiquetas deben ser directas y orientadas a la acción. Los iconos solos deben
tener `aria-label` y tooltip cuando su función no sea evidente.

## 7. Componentes comunes

Los módulos deben reutilizar patrones para:

- Encabezado y navegación.
- Breadcrumbs.
- Tarjetas KPI.
- Filtros y buscadores.
- Tablas y tarjetas responsive.
- Selectores y date pickers.
- Modales y confirmaciones.
- Alertas y notificaciones.
- Estados vacíos, carga, error y acceso restringido.
- Paginación y exportación.

Un componente nuevo debe definirse como patrón reutilizable si se repite en más
de un módulo.

## 8. Responsive

### Móvil

- Una columna.
- Acciones apiladas o de ancho completo.
- Tablas convertidas a tarjetas, listas o secciones expandibles.
- Filtros agrupados en un panel o drawer.
- No depender de hover para descubrir información.

### Tablet

- Una o dos columnas según el ancho disponible.
- Mantener controles principales visibles.
- Permitir tablas compactas solo cuando no sacrifiquen legibilidad.

### Escritorio

- Hasta dos columnas en formularios.
- Tablas completas para comparación de miembros, Squads y fechas.
- Acciones contextuales agrupadas y alineadas consistentemente.

## 9. Accesibilidad

- Navegación completa por teclado.
- Foco visible en todos los controles interactivos.
- Orden de tabulación lógico.
- Labels y nombres accesibles para inputs y botones.
- Mensajes de error asociados al campo.
- Contraste suficiente para texto, controles y estados.
- No comunicar información únicamente mediante color.
- Confirmaciones y cambios de estado anunciables para tecnologías de asistencia.

## 10. Excepciones

Una excepción al sistema de diseño debe documentar:

1. Componente o regla afectada.
2. Motivo de negocio o usabilidad.
3. Alcance de la excepción.
4. Impacto responsive y de accesibilidad.
5. Si debe convertirse en un nuevo patrón reutilizable.
