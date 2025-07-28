import { ExperienciaTuristica } from './ExperienciaTuristica.js';

export class ExperienciaAutoguiada extends ExperienciaTuristica {
    /**
     * Constructor for self-guided experience
     * @param {Array} fechas - Available dates
     * @param {number} precio - Price
     * @param {number} capacidadMaxima - Maximum capacity
     * @param {number} duracion - Duration in hours
     * @param {string} tipoEstrategia - Waiting list strategy type
     */
    constructor(fechas, precio, capacidadMaxima, duracion, tipoEstrategia) {
        super(fechas, precio, capacidadMaxima, duracion, false, tipoEstrategia);
    }

    /**
     * Get availability for a date
     * @param {string} fecha - Date to check
     * @returns {boolean} - Availability status
     */
    getDisponibilidad(fecha) {
        const fechaBuscada = this._parsearFecha(fecha);
        
        // Check if date exists in availability
        if (!this._existeFechaEnDisponibilidad(fechaBuscada)) {
            return false;
        }
        
        // Check if there are reservations for this date
        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );
        
        if (!reservaFecha) {
            return true;
        }
        
        // Calculate total number of people already reserved
        const personasReservadas = reservaFecha.reservas.reduce((total, reserva) => {
            return total + (typeof reserva === 'object' ? (reserva.cantidadPersonas || 1) : 1);
        }, 0);
        
        // Check if there's enough capacity
        return personasReservadas < this.capacidadMaxima;
    }
    
    /**
     * Add a date to availability
     * @param {string} fecha - Date to add
     */
    agregarFechaEnDisponibilidad(fecha) {
        const fechaBuscada = this._parsearFecha(fecha);
        
        // Check if date already exists
        if (this._existeFechaEnDisponibilidad(fechaBuscada)) {
            throw new Error("La fecha ya existe en la disponibilidad");
        }
        
        // Add date to availability
        this.disponibilidad.push(fecha);
        
        // Add date to lists
        this._agregarFechaEnListas(fecha);
    }
}
