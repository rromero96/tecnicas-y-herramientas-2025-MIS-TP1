import { ExperienciaTuristica } from './ExperienciaTuristica.js';

export class PaqueteDeAventura extends ExperienciaTuristica {
    /**
     * Constructor for adventure package
     * @param {Array} disponibilidad - Available dates
     * @param {number} precio - Price
     * @param {number} capacidadMaxima - Maximum capacity
     * @param {number} duracion - Duration in hours
     * @param {boolean} requiereGuia - Whether it requires a guide
     * @param {Array} actividades - Activities included in the package
     * @param {string} tipoEstrategia - Waiting list strategy type
     */
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, actividades, tipoEstrategia) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, tipoEstrategia);
        this.actividades = actividades; // objeto => [{nombre: "nombre de la actividad", disponibilidad:["01/01/2025"]}]
    }
    
    /**
     * Get activities names
     * @returns {Array} - List of activity names
     */
    GetActividades() {
        return this.actividades.map(actividad => actividad.nombre);
    }

    /**
     * Check availability for a date
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
        const estaDisponible = this.actividades.every(actividad => {
            return actividad.disponibilidad.some(fechaDisponible => {
                const fechaDisponibleObj = new Date(fechaDisponible);
                return fechaDisponibleObj.getTime() === fechaBuscada.getTime();
            });
        });
        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );
        return estaDisponible && (!reservaFecha || reservaFecha.reservas.length < this.capacidadMaxima);
    }
    
    /**
     * Add a date to availability
     * @param {string} fecha - Date to add
     */
    agregarFechaEnDisponibilidad(fecha) {
        try {
          this._parsearFecha(fecha);
        } catch (e) {
            console.error(`Error al validar fecha '${fecha}': ${e.message}`);
            throw new Error("La fecha proporcionada no es válida");
        }
        if (this._existeFechaEnDisponibilidad(fecha)) {
            throw new Error("La fecha ya está registrada en la disponibilidad");
        }
        this.disponibilidad.push(fecha);
        this.actividades.forEach(actividad => {
            actividad.disponibilidad.push(fecha);
        });
        this._agregarFechaEnListas(fecha);
        console.log(`Fecha ${fecha} agregada a la disponibilidad y actividades exitosamente.`);
    }

    /**
     * Get number of guides
     * @returns {number} - Number of guides (always 0 for adventure packages)
     */
    getGuias() {
        return 0; // PaqueteDeAventura no requiere guías específicos
    }

    /**
     * Check if a guide is required
     * @returns {boolean} - Whether a guide is required
     */
    requiereGuia() {
        return Boolean(this._requiereGuia);
    }
}
