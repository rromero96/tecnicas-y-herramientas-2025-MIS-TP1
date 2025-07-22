import {  EstrategiaListaEspera, EstrategiaDefault,   EstrategiaOrdenLlegadaEstricto,  EstrategiaCompletadoEficiente } from '../lista_espera.js';


class ExperienciaMock {
    constructor(disponibilidad = {}) {
        this.listaEspera = {};
        this.listaReservas = {};
        Object.keys(disponibilidad).forEach(fecha => {
            this.listaEspera[fecha] = [];
            this.listaReservas[fecha] = [];
        });
    }

    getListaEspera(fecha) {
        return this.listaEspera[fecha] || [];
    }

    removeListaEspera(fecha, nombre) {
        if (!this.listaEspera[fecha]) return false;
        const index = this.listaEspera[fecha].findIndex(r => (r.nombre || r) === nombre);
        if (index !== -1) {
            this.listaEspera[fecha].splice(index, 1);
            return true;
        }
        return false;
    }

    addListaReservas(fecha, reserva) {
        if (!this.listaReservas[fecha]) this.listaReservas[fecha] = [];
        this.listaReservas[fecha].push(reserva);
        return true;
    }
}

describe('EstrategiaListaEspera', () => {
    test('debe lanzar error al llamar el método abstracto procesarListaDeEspera', () => {
        const estrategia = new EstrategiaListaEspera();
        expect(() => estrategia.procesarListaDeEspera()).toThrow('El método procesarListaEspera debe ser implementado por las clases hijas');
    });
});

describe('EstrategiaDefault', () => {
    let experiencia;
    let estrategia;
    const fecha = '2024-04-01';

    beforeEach(() => {
        experiencia = new ExperienciaMock({ [fecha]: true });
        estrategia = new EstrategiaDefault();
    });

    test('debe procesar la primera reserva en la lista de espera', () => {
        // Agregar reservas a la lista de espera
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 3 }
        ];

        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);

        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaReservas[fecha][0].nombre).toBe('Cliente1');
        expect(experiencia.listaEspera[fecha]).toHaveLength(1);
        expect(experiencia.listaEspera[fecha][0].nombre).toBe('Cliente2');
    });

    test('no debe procesar ninguna reserva si la lista de espera está vacía', () => {
        experiencia.listaEspera[fecha] = [];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
    });

    test('no debe procesar ninguna reserva si los cupos liberados son insuficientes', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 }
        ];
        
        estrategia.procesarListaDeEspera(0, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
        expect(experiencia.listaEspera[fecha]).toHaveLength(1);
    });

    test('debe manejar reservas sin el atributo cantidadPersonas', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1' } 
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });

    test('debe manejar reservas sin el atributo nombre', () => {
        experiencia.listaEspera[fecha] = [
            { cantidadPersonas: 2 } 
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });
});

describe('EstrategiaOrdenLlegadaEstricto', () => {
    let experiencia;
    let estrategia;
    const fecha = '2024-04-01';

    beforeEach(() => {
        experiencia = new ExperienciaMock({ [fecha]: true });
        estrategia = new EstrategiaOrdenLlegadaEstricto();
    });

    test('debe procesar la primera reserva si hay suficientes cupos', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 3 },
            { nombre: 'Cliente2', cantidadPersonas: 2 }
        ];

        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);

        expect(experiencia.listaReservas[fecha]).toHaveLength(2);
        expect(experiencia.listaReservas[fecha][0].nombre).toBe('Cliente1');
        expect(experiencia.listaReservas[fecha][1].nombre).toBe('Cliente2');
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });

    test('debe lanzar error si no hay suficientes cupos para la primera reserva', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 6 },
            { nombre: 'Cliente2', cantidadPersonas: 2 }
        ];
        
        expect(() => {
            estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        }).toThrow("No hay cupos disponibles para procesar la reserva aun, esperar a que se libere");
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
        expect(experiencia.listaEspera[fecha]).toHaveLength(2);
    });

    test('debe procesar múltiples reservas hasta agotar los cupos', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 3 },
            { nombre: 'Cliente3', cantidadPersonas: 1 }
        ];
        
        estrategia.procesarListaDeEspera(6, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(3);
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });

    test('no debe procesar reservas si la lista de espera está vacía', () => {
        experiencia.listaEspera[fecha] = [];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
    });

    test('debe manejar reservas sin el atributo cantidadPersonas', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1' }
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });
});

describe('EstrategiaCompletadoEficiente', () => {
    let experiencia;
    let estrategia;
    const fecha = '2024-04-01';

    beforeEach(() => {
        experiencia = new ExperienciaMock({ [fecha]: true });
        estrategia = new EstrategiaCompletadoEficiente();
    });

    test('debe procesar una reserva que complete exactamente los cupos disponibles', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 5 }, 
            { nombre: 'Cliente3', cantidadPersonas: 3 }
        ];

        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);

        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaReservas[fecha][0].nombre).toBe('Cliente2');
        expect(experiencia.listaEspera[fecha]).toHaveLength(2);
    });

    test('debe encontrar parés que sumen el total de cupos disponibles', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 3 }, 
            { nombre: 'Cliente3', cantidadPersonas: 1 },
            { nombre: 'Cliente4', cantidadPersonas: 4 }
        ];

        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);

        expect(experiencia.listaReservas[fecha].length).toBeGreaterThan(0);
        
        const totalPersonas = experiencia.listaReservas[fecha].reduce(
            (sum, res) => sum + (res.cantidadPersonas || 1), 0);
        
  
        expect(totalPersonas).toBe(5);
        expect(experiencia.listaEspera[fecha].length).toBeGreaterThanOrEqual(2);
    });

    test('debe elegir la combinación más eficiente si no hay una combinación exacta', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 4 }
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
       
        expect(experiencia.listaReservas[fecha]).toHaveLength(1);
        expect(experiencia.listaReservas[fecha][0].nombre).toBe('Cliente2');
        expect(experiencia.listaEspera[fecha]).toHaveLength(1);
    });

    test('debe manejar combinaciones que sumen exactamente los cupos disponibles', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 2 },
            { nombre: 'Cliente2', cantidadPersonas: 2 },
            { nombre: 'Cliente3', cantidadPersonas: 3 }
        ];
        
        estrategia.procesarListaDeEspera(4, experiencia.listaEspera[fecha], experiencia, fecha);
        
     
        const totalPersonas = experiencia.listaReservas[fecha].reduce(
            (sum, res) => sum + (res.cantidadPersonas || 1), 0);
        
      
        expect(totalPersonas).toBe(4);
        expect(experiencia.listaEspera[fecha].length).toBeGreaterThanOrEqual(1);
    });

    test('no debe procesar reservas si la lista de espera está vacía', () => {
        experiencia.listaEspera[fecha] = [];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
    });

    test('debe manejar reservas sin el atributo cantidadPersonas', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1' }, 
            { nombre: 'Cliente2', cantidadPersonas: 4 }
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
      
        expect(experiencia.listaReservas[fecha]).toHaveLength(2);
        expect(experiencia.listaEspera[fecha]).toHaveLength(0);
    });

    test('debe manejar caso donde ninguna reserva cabe en los cupos disponibles', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 6 },
            { nombre: 'Cliente2', cantidadPersonas: 7 }
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);
        
        expect(experiencia.listaReservas[fecha]).toHaveLength(0);
        expect(experiencia.listaEspera[fecha]).toHaveLength(2);
    });

    test('debe minimizar los cupos que quedan sin usar', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 3 }, 
            { nombre: 'Cliente2', cantidadPersonas: 4 }, 
            { nombre: 'Cliente3', cantidadPersonas: 2 }  
        ];
        
        estrategia.procesarListaDeEspera(5, experiencia.listaEspera[fecha], experiencia, fecha);

        const totalUtilizado = experiencia.listaReservas[fecha].reduce(
            (sum, res) => sum + (res.cantidadPersonas || 1), 0);

        expect(5 - totalUtilizado).toBeLessThan(2);
        expect(experiencia.listaReservas[fecha].length).toBeGreaterThan(0);
        expect(experiencia.listaEspera[fecha].length).toBeGreaterThan(0);
    });
    
    test('debe usar eficientemente los cupos disponibles para múltiples reservas', () => {
        experiencia.listaEspera[fecha] = [
            { nombre: 'Cliente1', cantidadPersonas: 3 },
            { nombre: 'Cliente2', cantidadPersonas: 2 },
            { nombre: 'Cliente3', cantidadPersonas: 1 }
        ];
        
        estrategia.procesarListaDeEspera(7, experiencia.listaEspera[fecha], experiencia, fecha);
        
        const totalUtilizado = experiencia.listaReservas[fecha].reduce(
            (sum, res) => sum + (res.cantidadPersonas || 1), 0);
        
        expect(totalUtilizado).toBeGreaterThanOrEqual(5);
        expect(experiencia.listaReservas[fecha].length).toBeGreaterThanOrEqual(2);
    });
});
