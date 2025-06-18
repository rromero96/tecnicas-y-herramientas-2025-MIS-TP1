export class ExperienciaTuristica {
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

    getDisponibilidad(fecha) {
        throw new Error("El método 'Disponibilidad' debe ser implementado por la clase hija.");
    }
    
    agregarFechaEnDisponibilidad(fecha) {
        throw new Error("El método 'AgregarDisponibilidad' debe ser implementado por la clase hija.");
    }

    getGuias() {
        return this.requiereGuia
    }

    getPrecioTotal() {
        return this.precioTotal
    }

    getCapacidadMaxima() {
        return this.capacidadMaxima
    }

    getDuracion() {
        return this.duracion
    }

    addListaReservas(fecha, reservaInfo) {
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de reservas.");
        }

        // Si reservaInfo es un objeto, usarlo como tal, si no, crear un objeto simple con el nombre
        const infoReserva = typeof reservaInfo === 'object' ? reservaInfo : { nombre: reservaInfo, cantidadPersonas: 1 };
        
        reservaFecha.reservas.push(infoReserva);
        console.log(`Reserva confirmada para ${infoReserva.nombre || reservaInfo} en la fecha ${fecha}.`)
    }

    removeListaReservas(fecha, nombre) {
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaReservas.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de reservas.");
        }

        // Buscar por nombre o por objeto con propiedad nombre
        const index = reservaFecha.reservas.findIndex(reserva => {
            if (typeof reserva === 'object' && reserva.nombre) {
                return reserva.nombre === nombre;
            }
            return reserva === nombre;
        });
        
        if (index > -1) {
            reservaFecha.reservas.splice(index, 1);
            console.log(`Reserva cancelada para ${nombre} en la fecha ${fecha}.`);
        } else {
            throw new Error("El nombre no se encuentra en la lista de reservas.");
        }
    }

    getListaEspera(fecha) {
        const fechaBuscada = new Date(fecha);

        const esperaFecha = this.listaDeEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!esperaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        return esperaFecha.reservas;
    }

    addListaEspera(fecha, reservaInfo) {
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaDeEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        // Si reservaInfo es un objeto, usarlo como tal, si no, crear un objeto simple con el nombre
        const infoReserva = typeof reservaInfo === 'object' ? reservaInfo : { nombre: reservaInfo, cantidadPersonas: 1 };
        
        reservaFecha.reservas.push(infoReserva);
        console.log(`Reserva en lista de espera para ${infoReserva.nombre || reservaInfo} en la fecha ${fecha}.`)
    }

    removeListaEspera(fecha, nombre) {
        const fechaBuscada = new Date(fecha);

        const reservaFecha = this.listaDeEspera.find(
            r => r.fecha.getTime() === fechaBuscada.getTime()
        );

        if (!reservaFecha) {
            throw new Error("La fecha no está registrada en la lista de espera.");
        }

        // Buscar por nombre o por objeto con propiedad nombre
        const index = reservaFecha.reservas.findIndex(reserva => {
            if (typeof reserva === 'object' && reserva.nombre) {
                return reserva.nombre === nombre;
            }
            return reserva === nombre;
        });
        
        if (index > -1) {
            reservaFecha.reservas.splice(index, 1);
            console.log(`Reserva cancelada para ${nombre} en la lista de espera en la fecha ${fecha}.`);
        } else {
            throw new Error("El nombre no se encuentra en la lista de espera.");
        }
    }

    agregarFechaEnListaReservas(fecha) {
        const fechaBuscada = new Date(fecha);
        this.listaReservas.push({
            fecha: fechaBuscada,
            reservas: []
        });
    }

    agregarFechaEnListaEspera(fecha) {
        const fechaBuscada = new Date(fecha);
        this.listaDeEspera.push({
            fecha: fechaBuscada,
            reservas: []
        });
    }

    // Métodos utilitarios protegidos para subclases
    _parsearFecha(fecha) {
        const fechaBuscada = new Date(fecha);
        if (isNaN(fechaBuscada)) {
            throw new Error("La fecha proporcionada no es válida");
        }
        return fechaBuscada;
    }

    _existeFechaEnDisponibilidad(fecha) {
        const fechaBuscada = new Date(fecha);
        return this.disponibilidad.some(f => {
            const fechaDisponible = new Date(f);
            return fechaDisponible.getTime() === fechaBuscada.getTime();
        });
    }

    _agregarFechaEnListas(fecha) {
        this.agregarFechaEnListaReservas(fecha);
        this.agregarFechaEnListaEspera(fecha);
    }

    requiereGuia() {
        return Boolean(this.requiereGuia);
    }
}