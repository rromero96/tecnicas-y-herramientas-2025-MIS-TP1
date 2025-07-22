import { ExperienciaTuristica } from './experiencias.js';

export class ExcursionGuiada extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, guia,tipoEstrategia) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia,tipoEstrategia)
        this.guias = guia // numero de guias 
    }

    getGuias() {
        return this.guias // si no hay guias, no se puede realizar la reserva
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
        return this.listaReservas[fechaIndex].reservas.length < this.capacidadMaxima;
    }
    
    agregarFechaEnDisponibilidad(fecha) {
        try {
            this._parsearFecha(fecha);
        } catch (e) {
            throw new Error("La fecha proporcionada no es válida");
        }
        if (this._existeFechaEnDisponibilidad(fecha)) {
            throw new Error("La fecha ya está registrada en la disponibilidad");
        }
        this.disponibilidad.push(fecha);
        this._agregarFechaEnListas(fecha);
        console.log(`Fecha ${fecha} agregada a la disponibilidad exitosamente.`);
    }

    requiereGuia() {
        return Boolean(this.requiereGuia);
    }
}