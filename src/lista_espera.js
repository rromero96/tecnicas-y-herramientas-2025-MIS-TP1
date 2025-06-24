// Interfaz de estrategia de gestión de lista de espera
export class EstrategiaListaEspera {
    procesarListaDeEspera(cuposLiberados, listaDeEspera, experiencia, fecha) {
        throw new Error('El método procesarListaEspera debe ser implementado por las clases hijas');
    }
}

export class EstrategiaDefault extends EstrategiaListaEspera {
    procesarListaDeEspera(cuposLiberados, listaDeEspera, experiencia, fecha) {
        if (cuposLiberados > 0 && listaDeEspera.length > 0) {
            const nuevaReserva = listaDeEspera[0];
            const nombreReserva = nuevaReserva.nombre || nuevaReserva;
            experiencia.removeListaEspera(fecha, nombreReserva);
            experiencia.addListaReservas(fecha, nuevaReserva);
        }
    }
}


export class EstrategiaOrdenLlegadaEstricto extends EstrategiaListaEspera {
    procesarListaDeEspera(cuposLiberados, listaDeEspera, experiencia, fecha) {
        if (listaDeEspera.length === 0) return;
        
        const nuevaReserva = listaDeEspera[0];
        const personasNecesarias = nuevaReserva.cantidadPersonas || 1;
        
        if (personasNecesarias <= cuposLiberados) {
            const nombreReserva = nuevaReserva.nombre || nuevaReserva;
            experiencia.removeListaEspera(fecha, nombreReserva);
            experiencia.addListaReservas(fecha, nuevaReserva);
            
            const cuposRestantes = cuposLiberados - personasNecesarias;
            if (cuposRestantes > 0) {
                const listaDeEsperaActualizada = experiencia.getListaEspera(fecha);
                this.procesarListaDeEspera(cuposRestantes, listaDeEsperaActualizada, experiencia, fecha);
            }
        } else {
            throw new Error("No hay cupos disponibles para procesar la reserva aun, esperar a que se libere");
        }
    }
}

export class EstrategiaCompletadoEficiente extends EstrategiaListaEspera {
    procesarListaDeEspera(cuposLiberados, listaDeEspera, experiencia, fecha) {
        if (listaDeEspera.length === 0) return;
        
        let mejorCombinacion = [];
        let mejorUsoDeEspacio = 0;
        
        for (let i = 0; i < listaDeEspera.length; i++) {
            const reserva = listaDeEspera[i];
            const personasNecesarias = reserva.cantidadPersonas || 1;
            
            if (personasNecesarias === cuposLiberados) {
                const nombreReserva = reserva.nombre || reserva;
                experiencia.removeListaEspera(fecha, nombreReserva);
                experiencia.addListaReservas(fecha, reserva);
                return;
            }
            
            if (personasNecesarias <= cuposLiberados && personasNecesarias > mejorUsoDeEspacio) {
                mejorCombinacion = [i];
                mejorUsoDeEspacio = personasNecesarias;
            }
        }
        
        for (let i = 0; i < listaDeEspera.length - 1; i++) {
            const reserva1 = listaDeEspera[i];
            const personas1 = reserva1.cantidadPersonas || 1;
            
            if (personas1 > cuposLiberados) continue;
            
            for (let j = i + 1; j < listaDeEspera.length; j++) {
                const reserva2 = listaDeEspera[j];
                const personas2 = reserva2.cantidadPersonas || 1;
                const totalPersonas = personas1 + personas2;
                
                if (totalPersonas === cuposLiberados) {
                    const nombre1 = reserva1.nombre || reserva1;
                    experiencia.removeListaEspera(fecha, nombre1);
                    experiencia.addListaReservas(fecha, reserva1);
                    
                    const nombre2 = reserva2.nombre || reserva2;
                    experiencia.removeListaEspera(fecha, nombre2);
                    experiencia.addListaReservas(fecha, reserva2);
                    return;
                }
                
                if (totalPersonas <= cuposLiberados && totalPersonas > mejorUsoDeEspacio) {
                    mejorCombinacion = [i, j];
                    mejorUsoDeEspacio = totalPersonas;
                }
            }
        }
        
        for (const id of mejorCombinacion) {
            const reserva = listaDeEspera[id];
            const nombreReserva = reserva.nombre || reserva;
            experiencia.removeListaEspera(fecha, nombreReserva);
            experiencia.addListaReservas(fecha, reserva);
        }
        
        if (mejorUsoDeEspacio < cuposLiberados && mejorUsoDeEspacio > 0) {
            const cuposRestantes = cuposLiberados - mejorUsoDeEspacio;
            const listaActualizada = experiencia.getListaEspera(fecha);
            
            if (listaActualizada.length > 0 && cuposRestantes > 1) {
                this.procesarListaDeEspera(cuposRestantes, listaActualizada, experiencia, fecha);
            }
        }
    }
}