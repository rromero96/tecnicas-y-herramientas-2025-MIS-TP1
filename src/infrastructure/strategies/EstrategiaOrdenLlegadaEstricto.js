import { ListaEsperaStrategy } from '../../domain/interfaces/ListaEsperaStrategy.js';

export class EstrategiaOrdenLlegadaEstricto extends ListaEsperaStrategy {
    /**
     * Process waiting list in strict order of arrival
     * @param {number} cuposLiberados - Number of spots freed
     * @param {Array} listaEspera - Waiting list
     * @param {Object} experiencia - Experience object
     * @param {Date} fecha - Date
     */
    procesarListaDeEspera(cuposLiberados, listaEspera, experiencia, fecha) {
        console.log(`Procesando lista de espera con estrategia de orden estricto. Cupos liberados: ${cuposLiberados}`);
        
        // Procesar la lista de espera en orden estricto de llegada
        // Solo se procesan reservas si hay cupo para la primera de la lista
        if (listaEspera.length > 0) {
            const primeraReserva = listaEspera[0];
            const cantidadPersonas = primeraReserva.cantidadPersonas || 1; // Default a 1 si no está definida

            // Solo se procesa si hay suficiente cupo para la primera reserva
            if (cantidadPersonas <= cuposLiberados) {
                // Agregar la reserva a la lista de reservas
                experiencia.addListaReservas(fecha, primeraReserva);
                
                // Eliminar la reserva de la lista de espera
                listaEspera.shift();
                
                // Procesar recursivamente el resto de la lista con los cupos restantes
                const cuposRestantes = cuposLiberados - cantidadPersonas;
                if (cuposRestantes > 0) {
                    return this.procesarListaDeEspera(cuposRestantes, listaEspera, experiencia, fecha);
                }
            }
        }
        
        return cuposLiberados;
    }
}
