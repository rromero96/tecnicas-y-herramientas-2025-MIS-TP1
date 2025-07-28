---
status: "accepted"
date: 2025-07-27
decision-makers: equipo de desarrollo
---

# Diseño e implementación del servicio de facturación

## Context and Problem Statement

El sistema de reservas turísticas necesita gestionar la facturación, pagos y cancelación automática de reservas no pagadas. ¿Cómo podemos diseñar esta funcionalidad siguiendo los principios de Clean Architecture y asegurando la correcta separación de responsabilidades?

## Decision Drivers

* Necesidad de soportar diferentes métodos de pago (efectivo, transferencia)
* Importancia de validar los datos de pago según el método utilizado
* Requerimiento de cancelar automáticamente reservas no pagadas en plazo
* Alineación con los principios de Clean Architecture

## Considered Options

* Implementación monolítica dentro de la clase Reserva
* Servicio de facturación independiente en la capa de aplicación
* Microservicio separado para la facturación

## Decision Outcome

Chosen option: "Servicio de facturación independiente en la capa de aplicación", porque proporciona una clara separación de responsabilidades, permite la extensibilidad de métodos de pago y se integra bien con la arquitectura existente.

### Consequences

* Good, because separa claramente las responsabilidades de facturación de las reservas
* Good, because permite extender fácilmente con nuevos métodos de pago
* Good, because facilita la implementación de validaciones específicas por método de pago
* Good, because centraliza la lógica de cancelación automática de reservas no pagadas
* Bad, because aumenta la complejidad del sistema con nuevas entidades y servicios
* Bad, because requiere coordinación entre el servicio de facturación y las experiencias turísticas

### Confirmation

La implementación se confirmará mediante:
1. Pruebas unitarias para cada método de pago y sus validadores
2. Pruebas de integración para verificar la interacción entre facturación y reservas
3. Verificación de que la cancelación automática funciona correctamente y promueve reservas de la lista de espera

## Pros and Cons of the Options

### Implementación monolítica dentro de la clase Reserva

* Good, because es más simple inicialmente y requiere menos clases
* Good, because evita la necesidad de coordinación entre servicios
* Bad, because sobrecarga la clase Reserva con responsabilidades adicionales
* Bad, because dificulta la extensión con nuevos métodos de pago
* Bad, because mezcla diferentes conceptos de dominio (reserva y facturación)

### Servicio de facturación independiente en la capa de aplicación

* Good, because separa claramente las responsabilidades según el principio de responsabilidad única
* Good, because permite implementar diferentes métodos de pago de forma modular
* Good, because facilita la extensión con nuevos métodos de pago sin modificar código existente
* Bad, because requiere coordinación entre servicios
* Bad, because aumenta la complejidad inicial del sistema

### Microservicio separado para la facturación

* Good, because permite una separación completa y despliegue independiente
* Good, because podría escalar independientemente del resto del sistema
* Bad, because introduce complejidad excesiva para el tamaño actual del proyecto
* Bad, because requiere infraestructura adicional para la comunicación entre servicios
* Bad, because complica las transacciones que involucran múltiples servicios

## More Information

La implementación del servicio de facturación incluye:

1. **Entidades de dominio** (`src/domain/entities/pagos.js`):
   - Validadores (`ValidadorPlazo`, `ValidadorCUIT`, `ValidadorTitularTransferencia`, `ValidadorDescuento`)
   - Métodos de pago (`MedioDePago`, `PagoEfectivo`, `PagoTransferencia`)

2. **Servicio de aplicación** (`src/application/services/FacturacionService.js`):
   - Gestión de facturas
   - Registro de pagos
   - Verificación de vencimientos
   - Cancelación automática de reservas no pagadas

3. **Patrón Chain of Responsibility** para la validación de pagos:
   - Cada validador puede pasar la validación al siguiente en la cadena
   - Permite componer validaciones de forma flexible según el método de pago

Esta implementación sigue el principio de inversión de dependencias, donde el servicio de facturación depende de abstracciones (interfaces) en lugar de implementaciones concretas.
