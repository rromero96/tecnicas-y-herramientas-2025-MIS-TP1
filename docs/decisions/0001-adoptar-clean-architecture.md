---
status: "accepted"
date: 2025-07-27
decision-makers: equipo de desarrollo
---

# Adoptar Clean Architecture para la refactorización del sistema de reservas turísticas

## Context and Problem Statement

El sistema de reservas turísticas ha crecido orgánicamente sin una arquitectura clara, lo que ha resultado en código acoplado, difícil de mantener y probar. ¿Cómo podemos reestructurar el sistema para mejorar su mantenibilidad, testabilidad y escalabilidad?

## Decision Drivers

* Necesidad de separar claramente las responsabilidades
* Dificultad para probar componentes de manera aislada
* Acoplamiento entre lógica de negocio y detalles de implementación
* Deseo de facilitar futuras extensiones y cambios

## Considered Options

* Mantener la estructura actual y mejorar incrementalmente
* Adoptar un patrón MVC simple
* Implementar Clean Architecture con capas bien definidas
* Migrar a una arquitectura de microservicios

## Decision Outcome

Chosen option: "Implementar Clean Architecture con capas bien definidas", porque proporciona una clara separación de responsabilidades, facilita las pruebas unitarias y permite que la lógica de negocio sea independiente de los detalles de implementación.

### Consequences

* Good, because la lógica de negocio (dominio) queda aislada y protegida de cambios en otras capas
* Good, because mejora la testabilidad al permitir probar componentes de forma aislada
* Good, because establece reglas claras sobre dependencias entre capas (dependencia hacia adentro)
* Bad, because requiere una refactorización significativa del código existente
* Bad, because introduce una mayor complejidad inicial en la estructura del proyecto

### Confirmation

La implementación se confirmará mediante:
1. Revisión de código para verificar que las dependencias fluyan en la dirección correcta
2. Pruebas unitarias que demuestren la capacidad de probar componentes de forma aislada
3. Ejecución exitosa de todas las pruebas existentes después de la refactorización

## Pros and Cons of the Options

### Mantener la estructura actual y mejorar incrementalmente

* Good, because requiere menos esfuerzo inmediato
* Good, because minimiza el riesgo de introducir nuevos errores
* Bad, because no resuelve los problemas fundamentales de acoplamiento
* Bad, because no mejora significativamente la testabilidad

### Adoptar un patrón MVC simple

* Good, because es un patrón conocido y relativamente fácil de implementar
* Good, because proporciona cierta separación de responsabilidades
* Bad, because no ofrece una separación clara entre lógica de negocio y detalles de implementación
* Bad, because puede seguir resultando en acoplamiento entre componentes

### Implementar Clean Architecture con capas bien definidas

* Good, because separa claramente las responsabilidades en capas (dominio, aplicación, infraestructura, interfaces)
* Good, because la lógica de negocio no depende de frameworks ni detalles de implementación
* Good, because facilita el testing unitario y de integración
* Bad, because requiere una refactorización significativa
* Bad, because introduce más complejidad en la estructura del proyecto

### Migrar a una arquitectura de microservicios

* Good, because permitiría una escalabilidad extrema
* Good, because cada servicio podría evolucionar de forma independiente
* Bad, because introduce una complejidad excesiva para el tamaño actual del proyecto
* Bad, because requeriría cambios en la infraestructura y despliegue
* Bad, because el costo de implementación sería desproporcionado respecto a los beneficios inmediatos
