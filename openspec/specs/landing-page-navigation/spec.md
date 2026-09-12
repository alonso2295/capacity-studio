# landing-page-navigation Specification

## Purpose

Proporcionar una entrada clara y consistente a los módulos principales de Capacity Studio, facilitando su identificación y uso en escritorio, móvil y tecnologías de asistencia.

## Requirements

### Requirement: Presentar accesos uniformes a los módulos

El landing page SHALL mostrar cinco accesos principales para Miembros, Proveedores, Squads, Asignaciones y Métricas, y cada acceso SHALL conservar su ruta funcional existente.

#### Scenario: Usuario identifica los módulos disponibles

- **WHEN** el usuario abre la ruta raíz `/`
- **THEN** ve los cinco accesos con una etiqueta visible, una descripción breve y un icono asociado

#### Scenario: Usuario navega a un módulo

- **WHEN** el usuario activa cualquiera de los cinco accesos
- **THEN** es dirigido a `/members`, `/providers`, `/squads`, `/assignments` o `/metrics`, según corresponda

### Requirement: Mantener un lenguaje visual consistente

Cada acceso SHALL usar la misma estructura, proporción, espaciado, tratamiento de icono y estados interactivos, aplicando los tokens definidos por `docs/design-system.md`.

#### Scenario: Usuario interactúa con un acceso

- **WHEN** el puntero pasa sobre el acceso o este recibe foco por teclado
- **THEN** el acceso comunica visualmente su estado sin cambiar de tamaño ni romper la alineación del conjunto

#### Scenario: Usuario visualiza el landing en móvil

- **WHEN** el viewport no tiene espacio para una cuadrícula de varias columnas
- **THEN** los accesos se reorganizan en una columna legible, con áreas táctiles de al menos 44 px y sin scroll horizontal

### Requirement: Hacer accesibles los accesos iconográficos

Los iconos SHALL complementar el texto visible, no ser la única identificación del acceso, y los enlaces SHALL tener nombres accesibles y foco visible.

#### Scenario: Usuario navega con teclado

- **WHEN** recorre los controles interactivos usando Tab
- **THEN** cada acceso recibe foco en un orden lógico y su indicador de foco es visible

#### Scenario: Tecnología de asistencia interpreta un acceso

- **WHEN** un lector de pantalla anuncia un acceso
- **THEN** obtiene el nombre del módulo y su propósito sin anunciar como contenido relevante el SVG decorativo
