import { ListaEsperaStrategy } from '../../domain/interfaces/ListaEsperaStrategy.js';

export class EstrategiaCompletadoEficiente extends ListaEsperaStrategy {
    /**
     * Process waiting list optimizing for maximum capacity utilization
     * @param {number} cuposLiberados - Number of spots freed
     * @param {Array} listaEspera - Waiting list
     * @param {Object} experiencia - Experience object
     * @param {Date} fecha - Date
     */
    procesarListaDeEspera(cuposLiberados, listaEspera, experiencia, fecha) {
        console.log(`Procesando lista de espera con estrategia de completado eficiente. Cupos liberados: ${cuposLiberados}`);
        
        let cuposRestantes = cuposLiberados;
        
        // Ordenar la lista de espera por tamaño de grupo (mayor a menor)
        // Esto permite maximizar la ocupación de los cupos disponibles
        const listaOrdenada = [...listaEspera].sort((a, b) => 
            (b.cantidadPersonas || 1) - (a.cantidadPersonas || 1)
        );
        
        // Buscar el grupo más grande que quepa en los cupos liberados
        for (let reservaInfo of listaOrdenada) {
            const cantidadPersonas = reservaInfo.cantidadPersonas || 1; // Default a 1 si no está definida
            
            if (cantidadPersonas <= cuposRestantes) {
                // Encontrar el índice original en la lista de espera
                const indiceOriginal = listaEspera.findIndex(r => 
                    r.nombre === reservaInfo.nombre && 
                    r.email === reservaInfo.email
                );
                
                // Agregar la reserva a la lista de reservas
                experiencia.addListaReservas(fecha, reservaInfo);
                
                // Eliminar la reserva de la lista de espera original
                if (indiceOriginal !== -1) {
                    listaEspera.splice(indiceOriginal, 1);
                }
                
                // Actualizar los cupos restantes
                cuposRestantes -= cantidadPersonas;
                
                // Continuar con la siguiente iteración si aún quedan cupos
                if (cuposRestantes > 0) {
                    // Llamada recursiva con la lista actualizada
                    return this.procesarListaDeEspera(cuposRestantes, listaEspera, experiencia, fecha);
                }
                
                break;
            }
        }
        
        return cuposRestantes;
    }
}
