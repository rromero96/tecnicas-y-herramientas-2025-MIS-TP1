# Sistema de Gestión de Experiencias Turísticas

## Grupo 07

Integrantes del proyecto:
- Danilo Bambi
- Rodrigo Ignacio Romero

## Ejecución de Tests
```bash
npm i
npm run test:coverage
```

## Diagrama de Clases

![Class diagram](classDiagram.png)

## Descripción Funcional de las Clases

### Clases Principales

#### `ExperienciaTuristica` (Clase Abstracta)
Clase base para todas las experiencias turísticas. Gestiona aspectos comunes como disponibilidad de fechas, reservas, lista de espera y precios. Define la estructura y comportamiento básico que deben implementar sus clases hijas. Incluye la lógica para la gestión de reservas y lista de espera utilizando diferentes estrategias.

#### `ExcursionGuiada` (Extiende `ExperienciaTuristica`)
Implementa experiencias turísticas que requieren guías. Gestiona la disponibilidad considerando las fechas y el número de guías disponibles. Implementa los métodos abstractos definidos en la clase base.

#### `PaqueteDeAventura` (Extiende `ExperienciaTuristica`)
Implementa paquetes de experiencias que combinan múltiples actividades. Gestiona la disponibilidad considerando las fechas y la disponibilidad de todas las actividades incluidas. Mantiene la coherencia entre las reservas y listas de espera de todas las actividades del paquete.

#### `Reserva`
Modela una reserva para una experiencia turística. Contiene información sobre el cliente, la fecha, la cantidad de personas y la experiencia asociada. Implementa la funcionalidad para crear, cancelar y gestionar reservas.

### Estrategias de Lista de Espera

#### `EstrategiaListaEspera` (Clase Abstracta)
Define la interfaz para todas las estrategias de procesamiento de lista de espera. Declara el método abstracto `procesarListaDeEspera` que todas las estrategias concretas deben implementar.

#### `EstrategiaDefault`
Implementación básica que procesa la primera reserva de la lista de espera cuando se liberan cupos, sin consideraciones especiales.

#### `EstrategiaOrdenLlegadaEstricto`
Implementa una política estricta de "primero en llegar, primero en ser atendido". Respeta absolutamente el orden de llegada, procesando las reservas en secuencia y solo si hay suficientes cupos para cubrir completamente cada reserva. Si quedan cupos libres después de procesar una reserva, intenta procesar la siguiente recursivamente.

#### `EstrategiaCompletadoEficiente`
Implementa una estrategia que prioriza la utilización eficiente de los cupos disponibles. Busca la combinación de reservas que maximice el uso de los cupos liberados, incluso si esto significa no respetar estrictamente el orden de llegada. Primero busca coincidencias exactas (una sola reserva que llene todos los cupos), luego combinaciones de varias reservas, y si no encuentra una combinación exacta, elige la que deja menos cupos sin usar.

## Patrones de Diseño Implementados

### Patrón Strategy
Utilizado en la gestión de listas de espera, permitiendo intercambiar diferentes algoritmos de procesamiento sin alterar la clase cliente (`ExperienciaTuristica`). Las estrategias concretas (`EstrategiaDefault`, `EstrategiaOrdenLlegadaEstricto`, `EstrategiaCompletadoEficiente`) implementan diferentes algoritmos para la misma tarea.

### Patrón Template Method
Implementado en la clase `ExperienciaTuristica`, que define el "esqueleto" de las operaciones, dejando que las subclases (`ExcursionGuiada`, `PaqueteDeAventura`) implementen los pasos específicos. Por ejemplo, los métodos `getDisponibilidad()` y `agregarFechaEnDisponibilidad()` son abstractos en la clase base y tienen implementaciones específicas en las subclases.

### Patrón Factory Method
Utilizado en `ExperienciaTuristica` para crear e instanciar objetos de estrategia apropiados a través del método `setEstrategiaListaDeEspera()`. Crea las estrategias concretas basadas en el tipo especificado.
