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
        
        // Caso 1: Buscar reserva individual que se ajuste exactamente
        const reservaExacta = this._buscarReservaExacta(listaDeEspera, cuposLiberados);
        if (reservaExacta !== null) {
            this._confirmarReserva(reservaExacta, experiencia, fecha);
            return;
        }
        
        // Caso 2: Buscar par de reservas que se ajusten exactamente
        const parExacto = this._buscarParExacto(listaDeEspera, cuposLiberados);
        if (parExacto !== null) {
            this._confirmarReservas(parExacto, listaDeEspera, experiencia, fecha);
            return;
        }
        
        // Caso 3: Encontrar la mejor combinación posible
        const mejorCombinacion = this._encontrarMejorCombinacion(listaDeEspera, cuposLiberados);
        if (mejorCombinacion.indices.length > 0) {
            this._confirmarReservasIndices(mejorCombinacion.indices, listaDeEspera, experiencia, fecha);
            
            // Procesar cupos restantes recursivamente si quedan suficientes
            this._procesarCuposRestantes(cuposLiberados, mejorCombinacion.espacioUtilizado, experiencia, fecha);
        }
    }
    
    _buscarReservaExacta(listaDeEspera, cuposLiberados) {
        for (const reserva of listaDeEspera) {
            const personasNecesarias = reserva.cantidadPersonas || 1;
            if (personasNecesarias === cuposLiberados) {
                return reserva;
            }
        }
        return null;
    }
    
    _buscarParExacto(listaDeEspera, cuposLiberados) {
        for (let i = 0; i < listaDeEspera.length - 1; i++) {
            const reserva1 = listaDeEspera[i];
            const personas1 = reserva1.cantidadPersonas || 1;
            
            if (personas1 > cuposLiberados) continue;
            
            for (let j = i + 1; j < listaDeEspera.length; j++) {
                const reserva2 = listaDeEspera[j];
                const personas2 = reserva2.cantidadPersonas || 1;
                
                if (personas1 + personas2 === cuposLiberados) {
                    return [reserva1, reserva2];
                }
            }
        }
        return null;
    }
    
    _encontrarMejorCombinacion(listaDeEspera, cuposLiberados) {
        let mejorCombinacion = [];
        let mejorUsoDeEspacio = 0;
        
        // Comprobar reservas individuales
        for (let i = 0; i < listaDeEspera.length; i++) {
            const personasNecesarias = listaDeEspera[i].cantidadPersonas || 1;
            
            if (personasNecesarias <= cuposLiberados && personasNecesarias > mejorUsoDeEspacio) {
                mejorCombinacion = [i];
                mejorUsoDeEspacio = personasNecesarias;
            }
        }
        
        // Comprobar pares de reservas
        for (let i = 0; i < listaDeEspera.length - 1; i++) {
            const personas1 = listaDeEspera[i].cantidadPersonas || 1;
            
            if (personas1 > cuposLiberados) continue;
            
            for (let j = i + 1; j < listaDeEspera.length; j++) {
                const personas2 = listaDeEspera[j].cantidadPersonas || 1;
                const totalPersonas = personas1 + personas2;
                
                if (totalPersonas <= cuposLiberados && totalPersonas > mejorUsoDeEspacio) {
                    mejorCombinacion = [i, j];
                    mejorUsoDeEspacio = totalPersonas;
                }
            }
        }
        
        return { indices: mejorCombinacion, espacioUtilizado: mejorUsoDeEspacio };
    }
    
    _confirmarReserva(reserva, experiencia, fecha) {
        const nombreReserva = reserva.nombre || reserva;
        experiencia.removeListaEspera(fecha, nombreReserva);
        experiencia.addListaReservas(fecha, reserva);
    }
    
    _confirmarReservas(reservas, listaDeEspera, experiencia, fecha) {
        for (const reserva of reservas) {
            this._confirmarReserva(reserva, experiencia, fecha);
        }
    }
    
    _confirmarReservasIndices(indices, listaDeEspera, experiencia, fecha) {
        for (const indice of indices) {
            const reserva = listaDeEspera[indice];
            this._confirmarReserva(reserva, experiencia, fecha);
        }
    }
    
    _procesarCuposRestantes(cuposLiberados, espacioUtilizado, experiencia, fecha) {
        if (espacioUtilizado < cuposLiberados && espacioUtilizado > 0) {
            const cuposRestantes = cuposLiberados - espacioUtilizado;
            const listaActualizada = experiencia.getListaEspera(fecha);
            
            if (listaActualizada.length > 0 && cuposRestantes > 1) {
                this.procesarListaDeEspera(cuposRestantes, listaActualizada, experiencia, fecha);
            }
        }
    }
}