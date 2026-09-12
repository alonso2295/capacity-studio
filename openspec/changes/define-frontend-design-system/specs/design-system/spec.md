## Purpose

Define un lenguaje visual consistente, accesible y responsive para todas las páginas y formularios de Capacity Studio.

## ADDED Requirements

### Requirement: Cumplimiento del sistema de diseño

Toda página y componente frontend SHALL cumplir las reglas de `docs/design-system.md` y los requisitos de esta capability. Una excepción MUST estar documentada en la spec del módulo que la necesita.

#### Scenario: Página nueva sin excepción

- **WHEN** se crea una página nueva para un módulo
- **THEN** la página utiliza los tokens, componentes, estados y patrones responsive definidos por el sistema de diseño

#### Scenario: Excepción documentada

- **WHEN** un módulo necesita una variación visual o de interacción
- **THEN** la variación se documenta en su spec junto con su motivo y alcance

### Requirement: Identidad visual y jerarquía

La interfaz SHALL utilizar el cian `#0099CC` como color principal de marca, el magenta `#EE2C70` como color auxiliar moderado, fondos claros, textos azul oscuro o gris azulado y una jerarquía tipográfica consistente.

#### Scenario: Acción principal

- **WHEN** una página presenta su acción principal
- **THEN** la acción utiliza el tratamiento primario definido en el sistema de diseño y se distingue visualmente de acciones secundarias

#### Scenario: Uso de color auxiliar

- **WHEN** una página necesita resaltar un estado o indicador secundario
- **THEN** utiliza magenta u otro color semántico solo cuando aporta significado y no como decoración indiscriminada

### Requirement: Estructura consistente de formularios

Todo formulario SHALL presentar cada campo con label visible, control, indicación de obligatoriedad cuando corresponda, texto de ayuda opcional y mensaje de error asociado al campo.

#### Scenario: Campo obligatorio

- **WHEN** un formulario muestra un campo obligatorio
- **THEN** el usuario puede identificarlo antes de interactuar y el formulario explica qué debe completar

#### Scenario: Campo con ayuda

- **WHEN** un campo requiere contexto adicional para ser completado correctamente
- **THEN** el formulario muestra texto de ayuda cercano al campo sin reemplazar el label

#### Scenario: Error de validación

- **WHEN** el valor de un campo no cumple una regla
- **THEN** el mensaje de error aparece junto al campo, describe cómo corregirlo y se anuncia de forma accesible

### Requirement: Estados de controles

Los campos y botones SHALL representar de forma diferenciable los estados default, hover, focus, error, disabled, read-only, loading y success cuando sean aplicables.

#### Scenario: Enfoque por teclado

- **WHEN** un usuario navega al siguiente control usando el teclado
- **THEN** el control enfocado presenta un indicador visual claro y conserva un orden lógico de navegación

#### Scenario: Envío en progreso

- **WHEN** un formulario está procesando un envío
- **THEN** la acción de envío muestra estado loading y evita solicitudes duplicadas

#### Scenario: Campo no editable

- **WHEN** un campo es disabled o read-only
- **THEN** el usuario puede distinguir que no puede modificarlo y el valor conserva legibilidad suficiente

### Requirement: Jerarquía de acciones

Las páginas SHALL distinguir acciones primarias, secundarias y críticas mediante tratamiento visual, etiquetas orientadas a la acción y confirmaciones apropiadas.

#### Scenario: Acción secundaria

- **WHEN** una pantalla ofrece una acción complementaria
- **THEN** la acción utiliza el tratamiento secundario y no compite visualmente con la acción primaria

#### Scenario: Acción irreversible

- **WHEN** un usuario inicia una acción crítica e irreversible
- **THEN** el sistema solicita confirmación antes de ejecutarla y explica su consecuencia

#### Scenario: Botón iconográfico

- **WHEN** una acción se representa únicamente con un icono
- **THEN** el control incluye un nombre accesible y una ayuda contextual cuando su significado no sea evidente

### Requirement: Diseño responsive

Los formularios y páginas SHALL ser utilizables en móvil, tablet, portátil y escritorio sin perder información esencial ni acciones autorizadas.

#### Scenario: Formulario en móvil

- **WHEN** un usuario abre un formulario en una pantalla móvil
- **THEN** los campos se presentan en una columna legible, las acciones son fáciles de pulsar y no se requiere desplazamiento horizontal de toda la página

#### Scenario: Formulario en escritorio

- **WHEN** un usuario abre un formulario en una pantalla amplia
- **THEN** los campos relacionados pueden organizarse en hasta dos columnas sin romper el orden de lectura ni la jerarquía visual

#### Scenario: Acciones en móvil

- **WHEN** un formulario tiene acciones de guardar y cancelar en móvil
- **THEN** las acciones permanecen visibles, alcanzables y claramente diferenciadas

### Requirement: Accesibilidad visual y semántica

Los componentes SHALL comunicar su estado sin depender exclusivamente del color y SHALL proporcionar nombres, relaciones y mensajes comprensibles para tecnologías de asistencia.

#### Scenario: Error no dependiente del color

- **WHEN** un campo contiene un error
- **THEN** el sistema muestra texto o iconografía explicativa además del tratamiento cromático

#### Scenario: Control con icono

- **WHEN** un control utiliza un icono como parte de su acción
- **THEN** el control tiene un nombre accesible y el icono no es la única fuente de significado

### Requirement: Consistencia de componentes

Los componentes reutilizables SHALL mantener los mismos tokens, dimensiones, estados y patrones de interacción en todas las páginas, salvo excepciones documentadas.

#### Scenario: Mismo tipo de campo

- **WHEN** dos módulos utilizan el mismo tipo de campo
- **THEN** ambos campos comparten apariencia, estados, validación visual y comportamiento responsive

#### Scenario: Componente no contemplado

- **WHEN** un módulo requiere un patrón de interacción que no existe en el sistema de diseño
- **THEN** el patrón se define y revisa como extensión reusable antes de implementarse de forma aislada
