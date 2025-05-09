import { ExperienciaTuristica } from './experiencias.js';

export class PaqueteDeAventura extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, actividades) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.actividades =  actividades // objeto => [{nombre: "nombre de la actividad", disponibilidad:["01/01/2025"]}]
    }
    
    GetActividades() {
        return this.actividades.map(actividad => actividad.nombre)
    }

    GetDisponibilidad(fecha) {
        const fechaBuscada = new Date(fecha);
        if (isNaN(fechaBuscada)) {
            console.log("La fecha proporcionada no es válida");
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

        return estaDisponible && this.listaReservas[fechaIndex].reservas.length < this.capacidadMaxima;
    }
    
    AgregarFechaEnDisponibilidad(fecha) {
        const fechaBuscada = new Date(fecha);
        if (isNaN(fechaBuscada)) {
            throw new Error("La fecha proporcionada no es válida");
        }
        
        this.actividades.forEach(actividad => {
            const fechaExistenteEnActividad = actividad.disponibilidad.some(f => {
                const fechaDisponible = new Date(f);
                return fechaDisponible.getTime() === fechaBuscada.getTime();
            });
            
            if (fechaExistenteEnActividad) {
                throw new Error("La fecha ya está registrada en la disponibilidad");
            }

            actividad.disponibilidad.push(fecha);
            this.agregarFechaEnListaReservas(fecha);
            this.agregarFechaEnListaEspera(fecha);
        });
        
        console.log(`Fecha ${fecha} agregada a la disponibilidad y actividades exitosamente.`);
    }  
}
