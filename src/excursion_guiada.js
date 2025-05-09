import { ExperienciaTuristica } from './experiencias.js';

export class ExcursionGuiada extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, guia) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.guias = guia // numero de guias 
    }

    GetGuias() {
        return this.guias // si no hay guias, no se puede realizar la reserva
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

        return this.listaReservas[fechaIndex].reservas.length < this.capacidadMaxima;
    }
    
    AgregarFechaEnDisponibilidad(fecha) {
        const fechaBuscada = new Date(fecha);
        if (isNaN(fechaBuscada)) {
            throw new Error("La fecha proporcionada no es válida");
        }
        

        const fechaExistente = this.disponibilidad.some(f => {
            const fechaDisponible = new Date(f);
            return fechaDisponible.getTime() === fechaBuscada.getTime();
        });
        
        if (fechaExistente) {
            throw new Error("La fecha ya está registrada en la disponibilidad");
        }
        

        this.disponibilidad.push(fecha);
        

        this.agregarFechaEnListaReservas(fecha);
        this.agregarFechaEnListaEspera(fecha);
        
        console.log(`Fecha ${fecha} agregada a la disponibilidad exitosamente.`);
    }
}