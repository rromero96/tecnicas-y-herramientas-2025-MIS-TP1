export class ListaEsperaStrategy {
    /**
     * Process the waiting list when spots become available
     * @param {number} cuposLiberados - Number of spots freed
     * @param {Array} listaEspera - Waiting list
     * @param {Object} experiencia - Experience object
     * @param {Date} fecha - Date
     */
    procesarListaDeEspera(cuposLiberados, listaEspera, experiencia, fecha) {
        throw new Error("Method 'procesarListaDeEspera' must be implemented by derived classes");
    }
}
