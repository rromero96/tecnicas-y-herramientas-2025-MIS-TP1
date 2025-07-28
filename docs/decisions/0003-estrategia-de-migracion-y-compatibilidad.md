---
status: "accepted"
date: 2025-07-27
decision-makers: equipo de desarrollo
---

# Estrategia de migración y compatibilidad durante la refactorización

## Context and Problem Statement

Al refactorizar el sistema de reservas turísticas hacia Clean Architecture, necesitamos definir una estrategia que permita una migración gradual sin romper la funcionalidad existente. ¿Cómo podemos migrar el código a la nueva estructura manteniendo la compatibilidad con las pruebas y funcionalidades existentes?

## Decision Drivers

* Necesidad de mantener el sistema funcionando durante la refactorización
* Importancia de que las pruebas sigan pasando durante todo el proceso
* Deseo de evitar una refactorización "big bang" de alto riesgo
* Limitaciones de tiempo y recursos para la refactorización

## Considered Options

* Refactorización completa de una sola vez ("big bang")
* Migración gradual con capa de compatibilidad
* Desarrollo paralelo de nueva versión manteniendo la antigua

## Decision Outcome

Chosen option: "Migración gradual con capa de compatibilidad", porque permite una transición controlada mientras se mantiene la funcionalidad existente y las pruebas siguen pasando.

### Consequences

* Good, because minimiza el riesgo al permitir validar cada paso de la refactorización
* Good, because las pruebas pueden seguir ejecutándose durante todo el proceso
* Good, because permite entregar valor de forma incremental
* Bad, because temporalmente aumenta la complejidad del código al mantener dos estructuras
* Bad, because requiere trabajo adicional para crear y mantener la capa de compatibilidad

### Confirmation

La implementación se confirmará mediante:
1. Ejecución exitosa de todas las pruebas después de cada paso de la refactorización
2. Verificación de que la funcionalidad existente sigue operando correctamente
3. Eliminación gradual de la capa de compatibilidad a medida que se completa la migración

## Pros and Cons of the Options

### Refactorización completa de una sola vez ("big bang")

* Good, because evita la complejidad de mantener dos estructuras simultáneamente
* Good, because permite un diseño más limpio desde el principio
* Bad, because implica un alto riesgo de introducir errores
* Bad, because dificulta la validación incremental del proceso
* Bad, because puede resultar en un período largo sin un sistema completamente funcional

### Migración gradual con capa de compatibilidad

* Good, because permite una transición controlada y de bajo riesgo
* Good, because mantiene el sistema funcionando durante todo el proceso
* Good, because facilita la detección temprana de problemas
* Bad, because temporalmente aumenta la complejidad del código
* Bad, because requiere trabajo adicional para la capa de compatibilidad

### Desarrollo paralelo de nueva versión manteniendo la antigua

* Good, because permite un diseño limpio sin restricciones de compatibilidad
* Good, because la versión existente sigue funcionando sin cambios
* Bad, because duplica el esfuerzo de mantenimiento durante la transición
* Bad, because complica la migración de datos y usuarios
* Bad, because requiere más recursos y tiempo

## More Information

La estrategia de migración gradual incluye los siguientes pasos:

1. Crear la nueva estructura de carpetas según Clean Architecture
2. Migrar primero las entidades de dominio manteniendo su API pública
3. Implementar servicios de aplicación que encapsulen la lógica de negocio
4. Crear adaptadores en la capa de infraestructura para implementar las interfaces del dominio
5. Mantener imports compatibles mediante archivos de barril (index.js) que redirijan a las nuevas ubicaciones
6. Actualizar gradualmente las referencias en las pruebas para usar las nuevas ubicaciones
7. Eliminar el código antiguo una vez que todas las referencias se hayan actualizado
