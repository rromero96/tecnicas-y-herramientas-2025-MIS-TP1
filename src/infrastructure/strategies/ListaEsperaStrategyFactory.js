import { EstrategiaDefault } from './EstrategiaDefault.js';
import { EstrategiaOrdenLlegadaEstricto } from './EstrategiaOrdenLlegadaEstricto.js';
import { EstrategiaCompletadoEficiente } from './EstrategiaCompletadoEficiente.js';

// Enumeración para los tipos de estrategia
export const TipoEstrategia = {
    DEFAULT: 'default',
    ORDEN_LLEGADA_ESTRICTO: 'ordenLlegadaEstricto',
    COMPLETADO_EFICIENTE: 'completadoEficiente'
};

export class ListaEsperaStrategyFactory {
    /**
     * Create a strategy based on the type
     * @param {string} tipoEstrategia - Strategy type
     * @returns {ListaEsperaStrategy} - Strategy instance
     */
    static createStrategy(tipoEstrategia) {
        switch(tipoEstrategia) {
            case TipoEstrategia.ORDEN_LLEGADA_ESTRICTO:
                return new EstrategiaOrdenLlegadaEstricto();
            case TipoEstrategia.COMPLETADO_EFICIENTE:
                return new EstrategiaCompletadoEficiente();
            default:
                return new EstrategiaDefault();
        }
    }
}
