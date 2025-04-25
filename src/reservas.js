class Reserva {
    constructor(nombre, experiencia, fecha, descuentoGrupal, isGrupo,precio) {
        if (!(experiencia instanceof ExperienciaTuristica)) {
            throw new Error("El atributo 'experiencia' debe ser una instancia de ExperienciaTuristica o sus clases derivadas.");
        }
        this.nombre = nombre
        this.experiencia = experiencia
        this.fecha = fecha 
        this.fechaReserva = new Date()
        this.descuentoGrupal = descuentoGrupal // int
        this.tarifaReserva =  (precio * (1 - (descuentoGrupal / 100))) * 0.3
        this.isGrupo = isGrupo
        this.pago = false

    }

    Confirmar(){
        if (!this.experiencia.GetDisponibilidad(this.fecha)) {
            throw new Error("La fecha no está disponible para la reserva, puede sumarse a la lista de espera.")
        }

        if (this.experiencia.RequiereGuia()) {
            if (this.experiencia.GetGuias() <= 0) {
                throw new Error("No hay guías disponibles para la fecha seleccionada.")
            }
        }

        try {
            this.experiencia.AddListaReservas(this.fecha, this.nombre);
        } catch (error) {
            console.error(`Error al agregar la reserva: ${error.message}`);
        }
    }

    Cancelar(){
        try {
          this.experiencia.RemoveListaReservas(this.fecha, this.nombre);

          const listaDeEspera =  this.experiencia.GetListaEspera(this.fecha)
        
          if (listaDeEspera.length > 0) {
            const reservaEspera =listaDeEspera.shift()
            const nuevaReserva = new Reserva(
                reservaEspera,
                this.experiencia,
                this.plazolimite,
                this.fecha,
                this.descuentoGrupal,
                reservaEspera.isGrupo
            );

            nuevaReserva.Confirmar();
            console.log(`Reserva confirmada para ${nuevaReserva.nombre} en la fecha ${this.fecha}.`);
          }
        } catch (error) {
            console.error(`Error al procesar la cancelacion: ${error.message}`);
        }
    }

    AgregarListaEspera(){
        if (this.experiencia.GetDisponibilidad(this.fecha)) {
            throw new Error("La fecha está disponible para la reserva, no es necesario agregar a la lista de espera.");
        }

        try {
            this.experiencia.AddListaEspera(this.fecha, this.nombre);
            console.log(`Agregado a la lista de espera para ${this.nombre} en la fecha ${this.fecha}.`);
        } catch (error) {
            console.error(`Error al agregar a la lista de espera: ${error.message}`);
        }
    }

    EliminarListaEspera(){
        try {
            this.experiencia.RemoveListaEspera(this.fecha, this.nombre);
            console.log(`Eliminado de la lista de espera para ${this.nombre} en la fecha ${this.fecha}.`);
        } catch (error) {
            console.error(`Error al eliminar de la lista de espera: ${error.message}`);
        }
    }

    Pago(){
        if (this.pago) {
            throw new Error("El pago ya ha sido realizado.");
        }
        
        this.pago = true;
        console.log(`Pago confirmado para ${this.nombre}.`);
    }

    GetFechaReserva(){
        return this.fechaReserva
    }
}


