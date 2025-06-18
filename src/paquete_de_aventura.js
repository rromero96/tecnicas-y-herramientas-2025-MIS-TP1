import { ExperienciaTuristica } from './experiencias.js';

export class PaqueteDeAventura extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, actividades) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.actividades = actividades // objeto => [{nombre: "nombre de la actividad", disponibilidad:["01/01/2025"]}]
    }
    
    GetActividades() {
        return this.actividades.map(actividad => actividad.nombre)
    }

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
    
    agregarFechaEnDisponibilidad(fecha) {
        let fechaBuscada;
        try {
            fechaBuscada = this._parsearFecha(fecha);
        } catch (e) {
            throw e;
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

    getGuias() {
        return 0; // PaqueteDeAventura no requiere guías específicos
    }

    requiereGuia() {
        return Boolean(this.requiereGuia);
    }
}
