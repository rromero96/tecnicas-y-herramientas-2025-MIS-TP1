import { ListaEsperaStrategy } from '../../domain/interfaces/ListaEsperaStrategy.js';

export class EstrategiaDefault extends ListaEsperaStrategy {
    /**
     * Process waiting list in order of arrival
     * @param {number} cuposLiberados - Number of spots freed
     * @param {Array} listaEspera - Waiting list
     * @param {Object} experiencia - Experience object
     * @param {Date} fecha - Date
     */
    procesarListaDeEspera(cuposLiberados, listaEspera, experiencia, fecha) {
        console.log(`Procesando lista de espera con estrategia default. Cupos liberados: ${cuposLiberados}`);
        
        let cuposRestantes = cuposLiberados;
        
        // Procesar la lista de espera en orden de llegada
        while (cuposRestantes > 0 && listaEspera.length > 0) {
            const reservaInfo = listaEspera[0];
            
            // Determinar la cantidad de personas (default a 1 si no está definido)
            const cantidadPersonas = reservaInfo.cantidadPersonas || 1;
            
            // Si la reserva requiere más personas de las que hay disponibles, no se puede procesar
            if (cantidadPersonas > cuposRestantes) {
                break;
            }
            
            // Agregar la reserva a la lista de reservas
            experiencia.addListaReservas(fecha, reservaInfo);
            
            // Eliminar la reserva de la lista de espera
            const nombreReserva = reservaInfo.nombre || reservaInfo;
            experiencia.removeListaEspera(fecha, nombreReserva);
            
            // Actualizar los cupos restantes
            cuposRestantes -= cantidadPersonas;
        }
        
        return cuposRestantes;
    }
}
