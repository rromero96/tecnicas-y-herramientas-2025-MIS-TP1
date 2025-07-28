---
status: "accepted"
date: 2025-07-27
decision-makers: equipo de desarrollo
---

# Uso del patrón Estrategia para la gestión de listas de espera

## Context and Problem Statement

El sistema de reservas turísticas necesita manejar diferentes políticas para procesar las listas de espera cuando se liberan cupos en una experiencia turística. ¿Cómo podemos diseñar esta funcionalidad de manera que sea flexible, extensible y cumpla con los principios de Clean Architecture?

## Decision Drivers

* Necesidad de soportar múltiples algoritmos para procesar listas de espera
* Deseo de poder cambiar el algoritmo en tiempo de ejecución
* Importancia de mantener el código limpio y testeable
* Alineación con los principios de Clean Architecture

## Considered Options

* Implementación con condicionales dentro de la clase ExperienciaTuristica
* Uso del patrón Estrategia con implementaciones concretas
* Uso de funciones de orden superior (enfoque funcional)

## Decision Outcome

Chosen option: "Uso del patrón Estrategia con implementaciones concretas", porque permite encapsular diferentes algoritmos, facilita la extensión con nuevas estrategias y se alinea bien con los principios de Clean Architecture.

### Consequences

* Good, because encapsula los diferentes algoritmos de procesamiento de lista de espera
* Good, because permite cambiar la estrategia en tiempo de ejecución
* Good, because facilita la adición de nuevas estrategias sin modificar código existente
* Good, because mejora la testabilidad al poder probar cada estrategia de forma aislada
* Bad, because introduce más clases y complejidad estructural

### Confirmation

La implementación se confirmará mediante:
1. Pruebas unitarias para cada estrategia de lista de espera
2. Verificación de que se pueden intercambiar estrategias sin modificar la clase ExperienciaTuristica
3. Comprobación de que las estrategias funcionan correctamente en escenarios reales

## Pros and Cons of the Options

### Implementación con condicionales dentro de la clase ExperienciaTuristica

* Good, because es más simple y directa de implementar inicialmente
* Good, because no requiere clases adicionales
* Bad, because viola el principio Open/Closed al requerir modificaciones para nuevas estrategias
* Bad, because dificulta las pruebas unitarias al mezclar la lógica de estrategia con la clase principal
* Bad, because aumenta la complejidad de la clase ExperienciaTuristica

### Uso del patrón Estrategia con implementaciones concretas

* Good, because encapsula cada algoritmo en su propia clase
* Good, because permite cambiar el comportamiento en tiempo de ejecución
* Good, because facilita la adición de nuevas estrategias sin modificar código existente
* Good, because mejora la testabilidad de cada estrategia
* Bad, because introduce más clases y complejidad estructural
* Bad, because requiere un mecanismo para seleccionar la estrategia adecuada

### Uso de funciones de orden superior (enfoque funcional)

* Good, because es más ligero que crear clases completas
* Good, because puede ser más conciso y expresivo
* Bad, because JavaScript no es un lenguaje puramente funcional
* Bad, because puede ser menos explícito y más difícil de entender para desarrolladores no familiarizados
* Bad, because no se alinea tan bien con el diseño orientado a objetos del resto del sistema

## More Information

La implementación del patrón Estrategia incluye:

1. Una interfaz `ListaEsperaStrategy` en la capa de dominio que define el contrato para procesar listas de espera
2. Implementaciones concretas en la capa de infraestructura:
   - `EstrategiaDefault`: Procesa la lista en orden de llegada
   - `EstrategiaPrioridad`: Prioriza según criterios específicos
3. La clase `ExperienciaTuristica` recibe la estrategia a utilizar y la invoca cuando es necesario

Este diseño permite que la lógica de negocio (dominio) defina el contrato mientras que los detalles de implementación residen en la capa de infraestructura, siguiendo el principio de inversión de dependencias.
