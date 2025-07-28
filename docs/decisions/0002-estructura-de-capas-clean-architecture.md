---
status: "accepted"
date: 2025-07-27
decision-makers: equipo de desarrollo
---

# Estructura de capas específica para implementar Clean Architecture

## Context and Problem Statement

Habiendo decidido adoptar Clean Architecture para el sistema de reservas turísticas, necesitamos definir la estructura específica de carpetas y capas. ¿Cómo debemos organizar el código para reflejar los principios de Clean Architecture y facilitar la migración desde la estructura actual?

## Decision Drivers

* Necesidad de una separación clara entre las diferentes responsabilidades
* Facilitar la migración gradual desde la estructura actual
* Mantener la compatibilidad con las pruebas existentes
* Seguir los principios de dependencia de Clean Architecture (dependencias hacia adentro)

## Considered Options

* Estructura de tres capas (dominio, aplicación, infraestructura)
* Estructura de cuatro capas (dominio, aplicación, infraestructura, interfaces)
* Estructura basada en funcionalidades con Clean Architecture dentro de cada una

## Decision Outcome

Chosen option: "Estructura de cuatro capas (dominio, aplicación, infraestructura, interfaces)", porque proporciona una separación completa de responsabilidades y sigue fielmente los principios de Clean Architecture.

### Consequences

* Good, because establece una clara separación de responsabilidades
* Good, because permite una migración gradual manteniendo compatibilidad
* Good, because facilita la implementación del principio de inversión de dependencias
* Bad, because requiere más carpetas y archivos, aumentando la complejidad inicial
* Bad, because implica más trabajo de refactorización

### Confirmation

La implementación se confirmará mediante:
1. Revisión de la estructura de carpetas y archivos
2. Verificación de que las dependencias fluyen correctamente (hacia adentro)
3. Ejecución exitosa de todas las pruebas después de la refactorización

## Pros and Cons of the Options

### Estructura de tres capas (dominio, aplicación, infraestructura)

* Good, because es más simple y directa
* Good, because reduce la cantidad de carpetas y archivos
* Bad, because mezcla las interfaces de usuario con la infraestructura
* Bad, because no separa claramente las interfaces externas de los detalles de implementación

### Estructura de cuatro capas (dominio, aplicación, infraestructura, interfaces)

* Good, because separa completamente todas las responsabilidades
* Good, because sigue fielmente los principios de Clean Architecture
* Good, because aísla completamente la lógica de negocio de las interfaces externas
* Bad, because introduce más complejidad en la estructura de carpetas
* Bad, because puede resultar excesiva para proyectos pequeños

### Estructura basada en funcionalidades con Clean Architecture dentro de cada una

* Good, because agrupa el código relacionado por funcionalidad
* Good, because facilita encontrar todo el código relacionado con una funcionalidad
* Bad, because puede llevar a duplicación de código entre funcionalidades
* Bad, because dificulta mantener la consistencia de la arquitectura entre funcionalidades

## More Information

La estructura específica de carpetas implementada es:

1. **Domain Layer** (`src/domain/`):
   - `entities/`: Objetos de negocio centrales
   - `repositories/`: Interfaces para acceso a datos
   - `interfaces/`: Contratos e interfaces del dominio

2. **Application Layer** (`src/application/`):
   - `services/`: Orquestación de lógica de negocio
   - `use-cases/`: Reglas de negocio específicas de la aplicación

3. **Infrastructure Layer** (`src/infrastructure/`):
   - `persistence/`: Implementaciones de bases de datos
   - `strategies/`: Implementaciones de patrones de estrategia

4. **Interface Layer** (`src/interfaces/`):
   - `controllers/`: Manejadores de solicitudes
   - `routes/`: Puntos de entrada de API
