
class ExperienciaTuristica {
    constructor(fechas, precio, capacidadMaxima, duracion, requiereGuia) {
        if (new.target === ExperienciaTuristica) {
            throw new Error("ExperienciaTuristica es una clase abstracta y no puede ser instanciada directamente.");
        }
        this.disponibilidad = fechas // ["01/01/2025", "02/01/2025"]
        this.precioTotal = precio // int
        this.capacidadMaxima = capacidadMaxima 
        this.duracion = duracion // en horas
        this.requiereGuia = requiereGuia // bool
        this.listaReservas = this.disponibilidad.map(fecha => ({
            fecha: new Date(fecha), 
            reservas: [] 
        }));
        this.listaDeEspera = this.disponibilidad.map(fecha => ({
            fecha: new Date(fecha), 
            reservas: [] 
        }));
    }

    GetDisponibilidad(fecha){
       throw new Error("El método 'Disponibilidad' debe ser implementado por la clase hija.");
    }

    RequiereGuia(){
        return this.requiereGuia
    }

    GetPrecioTotal(){
        return this.PrecioTotal
    }

    GetCapacidadMaxima(){
        return this.capacidadMaxima
    }

    GetDuracion(){
        return this.duracion
    }

    GetCapacidadMaxima(){
        return this.capacidadMaxima
    }

    AddListaReservas(fecha, nombre){
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de reservas.");
        }

        reservaFecha.reservas.push(nombre)
        console.log(`Reserva confirmada para ${nombre} en la fecha ${fecha}.`)
    }

    RemoveListaReservas(fecha, nombre){
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de reservas.");
        }

        const index = reservaFecha.reservas.indexOf(nombre);
        if (index > -1) {
            reservaFecha.reservas.splice(index, 1);
            console.log(`Reserva cancelada para ${nombre} en la fecha ${fecha}.`);
        } else {
            throw new Error("El nombre no se encuentra en la lista de reservas.");
        }
    }

    GetListaEspera(fecha){
        const fechaBuscada = new Date(fecha);

        const esperaFecha = this.listaEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!esperaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        return esperaFecha.reservas;
    }

    AddListaEspera(fecha, nombre){
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaDeEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        reservaFecha.reservas.push(nombre)
        console.log(`Reserva en lista de espera para ${nombre} en la fecha ${fecha}.`)
    }

    RemoveListaEspera(fecha, nombre){
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaDeEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        const index = reservaFecha.reservas.indexOf(nombre);
        if (index > -1) {
            reservaFecha.reservas.splice(index, 1);
            console.log(`Reserva cancelada para ${nombre} en la lista de espera en la fecha ${fecha}.`);
        } else {
            throw new Error("El nombre no se encuentra en la lista de espera.");
        }
    }
}

class ExcursionGuiada extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, guia) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.guias = guia // numero de guias 
    }

    GetGuias() {
        return this.guias // si no hay guias, no se puede realizar la reserva
    }

    GetDisponibilidad(fecha) {
        const fecha = new Date(fecha)
        if (isNaN(fecha)) {
            console.log("La fecha proporcionada no es válida")
            return false
        }
        for (let i = 0; i < this.disponibilidad.length; i++) {
            let fechaDisponible = new Date(this.disponibilidad[i])
            return fechaDisponible.getTime() === fecha.getTime() && this.listaReservas[i].reservas.length < this.capacidadMaxima
        }
        return false
    }
}

class PaqueteDeAventura extends ExperienciaTuristica {
    constructor(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia, actividades) {
        super(disponibilidad, precio, capacidadMaxima, duracion, requiereGuia)
        this.actividades =  actividades // objeto => [{nombre: "nombre de la actividad", disponibilidad:["01/01/2025"]}]
    }

    GetActividades() {
        return this.actividades.map(actividad => actividad.nombre)
    }

    GetDisponibilidad(fecha){
        const fechaBuscada = new Date(fecha)
        if (isNaN(fecha)) {
            console.log("La fecha proporcionada no es válida")
            return false
        }
        
        const estaDiponible = this.actividades.every(actividad => {
            return actividad.disponibilidad.some(fechaDisponible => {
                const fechaDisponibleObj = new Date(fechaDisponible);
                return fechaDisponibleObj.getTime() === fechaBuscada.getTime() && this.listaReservas[i].reservas.length < this.capacidadMaxima
            });
        });
    
        return estaDiponible
    }  
}
