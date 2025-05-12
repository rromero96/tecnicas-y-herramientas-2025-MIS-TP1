import { ExperienciaTuristica } from './experiencias.js';

export class PaqueteDeAventura extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, actividades) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.actividades = actividades // objeto => [{nombre: "nombre de la actividad", disponibilidad:["01/01/2025"]}]
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

        // Verificar si la fecha está en la disponibilidad general
        const fechaIndex = this.disponibilidad.findIndex(f => {
            const fechaDisponible = new Date(f);
            return fechaDisponible.getTime() === fechaBuscada.getTime();
        });

        if (fechaIndex === -1) {
            return false;
        }

        // Verificar si todas las actividades están disponibles para esa fecha
        const estaDisponible = this.actividades.every(actividad => {
            return actividad.disponibilidad.some(fechaDisponible => {
                const fechaDisponibleObj = new Date(fechaDisponible);
                return fechaDisponibleObj.getTime() === fechaBuscada.getTime();
            });
        });

        // Verificar si hay capacidad disponible
        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        return estaDisponible && (!reservaFecha || reservaFecha.reservas.length < this.capacidadMaxima);
    }
    
    AgregarFechaEnDisponibilidad(fecha) {
        const fechaBuscada = new Date(fecha);
        if (isNaN(fechaBuscada)) {
            throw new Error("La fecha proporcionada no es válida");
        }
        
        // Verificar si la fecha ya existe en la disponibilidad general
        const fechaExistente = this.disponibilidad.some(f => {
            const fechaDisponible = new Date(f);
            return fechaDisponible.getTime() === fechaBuscada.getTime();
        });
        
        if (fechaExistente) {
            throw new Error("La fecha ya está registrada en la disponibilidad");
        }

        // Agregar la fecha a la disponibilidad general
        this.disponibilidad.push(fecha);
        
        // Agregar la fecha a todas las actividades
        this.actividades.forEach(actividad => {
            actividad.disponibilidad.push(fecha);
        });
        
        // Agregar la fecha a las listas de reservas y espera
        this.agregarFechaEnListaReservas(fecha);
        this.agregarFechaEnListaEspera(fecha);
        
        console.log(`Fecha ${fecha} agregada a la disponibilidad y actividades exitosamente.`);
    }

    GetGuias() {
        return 0; // PaqueteDeAventura no requiere guías específicos
    }
}
