import { ExperienciaTuristica } from './ExperienciaTuristica.js';

export class ExcursionGuiada extends ExperienciaTuristica {
    /**
     * Constructor for guided excursion
     * @param {Array} disponibilidad - Available dates
     * @param {number} precio - Price
     * @param {number} capacidadMaxima - Maximum capacity
     * @param {number} duracion - Duration in hours
     * @param {boolean} requiereGuia - Whether it requires a guide
     * @param {number} guia - Number of guides
     * @param {string} tipoEstrategia - Waiting list strategy type
     */
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, guia, tipoEstrategia) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, tipoEstrategia);
        this.guias = guia; // numero de guias 
    }

    /**
     * Get number of guides
     * @returns {number} - Number of guides
     */
    getGuias() {
        return this.guias; // si no hay guias, no se puede realizar la reserva
    }

    /**
     * Get availability for a date
     * @param {string} fecha - Date to check
     * @returns {boolean} - Availability status
     */
    getDisponibilidad(fecha) {
        let fechaBuscada;
        try {
            fechaBuscada = this._parsearFecha(fecha);
        } catch (e) {
            console.log(e.message);
            return false;
        }
        const fechaIndex = this.disponibilidad.findIndex(f => {
            const fechaDisponible = new Date(f);
            return fechaDisponible.getTime() === fechaBuscada.getTime();
        });
        if (fechaIndex === -1) {
            return false;
        }
        return this.listaReservas[fechaIndex].reservas.length < this.capacidadMaxima;
    }
    
    /**
     * Add a date to availability
     * @param {string} fecha - Date to add
     */
    agregarFechaEnDisponibilidad(fecha) {
        try {
            this._parsearFecha(fecha);
        } catch (e) {
            // Registrar detalles adicionales del error para depuración
            console.error(`Error al validar fecha '${fecha}': ${e.message}`);
            // Mantener el mensaje de error original para compatibilidad con las pruebas
            throw new Error("La fecha proporcionada no es válida");
        }
        if (this._existeFechaEnDisponibilidad(fecha)) {
            throw new Error("La fecha ya está registrada en la disponibilidad");
        }
        this.disponibilidad.push(fecha);
        this._agregarFechaEnListas(fecha);
        console.log(`Fecha ${fecha} agregada a la disponibilidad exitosamente.`);
    }

    /**
     * Check if a guide is required
     * @returns {boolean} - Whether a guide is required
     */
    requiereGuia() {
        return Boolean(this._requiereGuia);
    }
}
