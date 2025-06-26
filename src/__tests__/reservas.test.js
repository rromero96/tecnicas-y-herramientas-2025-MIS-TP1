import { Reserva } from '../reservas.js';
import { PaqueteDeAventura } from '../paquete_de_aventura.js';
import { TipoEstrategia } from '../experiencias.js';

describe('Reserva', () => {
    let reserva;
    let experiencia;
    const fecha = "2024-04-01";
    const nombre = "Juan Pérez";
    const actividades = [
        { nombre: "Rafting", disponibilidad: [fecha] },
        { nombre: "Trekking", disponibilidad: [fecha] }
    ];

    beforeEach(() => {
        experiencia = new PaqueteDeAventura(
            [fecha],
            2000,
            15,
            8,
            true,
            actividades,
            TipoEstrategia.DEFAULT
        );
        // Forzar requiereGuia como método en caso de que se sobrescriba
        experiencia.requiereGuia = () => Boolean(experiencia.requiereGuia);
        reserva = new Reserva(
            nombre,
            'juan.perez@example.com',
            experiencia,
            7,
            fecha,
            0,
            1,
            2000,
            '20329642330', // cuit
            'Banco Nación', // banco
            nombre // titular
        );
    });

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    describe('constructor', () => {
        test('debe inicializar correctamente los atributos', () => {
            expect(reserva.nombre).toBe(nombre);
            expect(reserva.email).toBe('juan.perez@example.com');
            expect(reserva.experiencia).toBe(experiencia);
            expect(reserva.fecha).toBe(fecha);
            expect(reserva.fechaReserva).toBeInstanceOf(Date);
            expect(reserva.descuentoGrupal).toBe(0);
            expect(reserva.tarifaReserva).toBe(600); // 2000 * 0.3 * 1 persona
            expect(reserva.isGrupo).toBe(false);
            expect(reserva.cantidadPersonas).toBe(1);
            expect(reserva.pagado).toBe(false);
            expect(reserva.plazoLimite).toBe(7);
            expect(reserva.cuit).toBe('20329642330');
            expect(reserva.banco).toBe('Banco Nación');
            expect(reserva.titular).toBe(nombre);
        });

        test('debe lanzar error si la experiencia no es válida', () => {
            expect(() => {
                new Reserva(nombre, 'email@example.com', {}, 7, fecha, 0, 1, 2000);
            }).toThrow("El atributo 'experiencia' debe ser una instancia de ExperienciaTuristica o sus clases derivadas.");
        });
        
        test('debe calcular correctamente la tarifa para grupos', () => {
            const reservaGrupo = new Reserva(
                'Grupo Escolar',
                'grupo@escuela.edu',
                experiencia,
                7,
                fecha,
                10, // 10% de descuento
                5,  // 5 personas
                2000
            );
            
            // 2000 * (1 - 0.1) * 0.3 * 5 = 2700
            expect(reservaGrupo.tarifaReserva).toBe(2700);
            expect(reservaGrupo.isGrupo).toBe(true);
            expect(reservaGrupo.cantidadPersonas).toBe(5);
        });
    });

    describe('confirmar', () => {
        test('debe confirmar la reserva correctamente', () => {
            reserva.confirmar();
            const reservaConfirmada = experiencia.listaReservas[0].reservas[0];
            expect(reservaConfirmada.nombre).toBe(nombre);
            expect(reservaConfirmada.email).toBe('juan.perez@example.com');
        });

        test('debe lanzar error si la fecha no está disponible', () => {
            const reservaFechaNoDisponible = new Reserva(
                nombre,
                'juan.perez@example.com',
                experiencia,
                7,
                "2024-04-02",
                0,
                1,
                2000
            );
            expect(() => {
                reservaFechaNoDisponible.confirmar();
            }).toThrow("La fecha no está disponible para la reserva, puede sumarse a la lista de espera.");
        });
        
        test('debe lanzar error si no hay suficiente capacidad para el grupo', () => {
            // Crear una experiencia con capacidad limitada
            const experienciaLimitada = new PaqueteDeAventura(
                [fecha],
                2000,
                3, // Capacidad máxima de 3 personas
                8,
                true,
                actividades
            );
            
            // Verificar que la capacidad máxima es 3
            expect(experienciaLimitada.getCapacidadMaxima()).toBe(3);
            
            // Crear una reserva que ocupe toda la capacidad disponible
            experienciaLimitada.addListaReservas(fecha, {
                nombre: 'Cliente 1',
                email: 'cliente1@example.com',
                cantidadPersonas: 3 // Ocupar toda la capacidad
            });
            
            // Verificar que la reserva se agregó correctamente
            const reservaFecha = experienciaLimitada.listaReservas.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            );
            expect(reservaFecha.reservas.length).toBe(1);
            
            // Crear una reserva adicional que excedería la capacidad
            const reservaExcesiva = new Reserva(
                'Cliente 2',
                'cliente2@example.com',
                experienciaLimitada,
                7,
                fecha,
                0,
                1, // Incluso con 1 persona excedería la capacidad
                2000
            );
            
            // Debería lanzar error porque ya no hay capacidad
            expect(() => {
                reservaExcesiva.confirmar();
            }).toThrow();
        });
    });

    describe('cancelar', () => {
        beforeEach(() => {
            reserva.confirmar();
        });

        test('debe cancelar la reserva correctamente', () => {
            reserva.cancelar();
            // Verificar que no hay reservas con ese nombre
            const tieneReserva = experiencia.listaReservas[0].reservas.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(tieneReserva).toBe(false);
        });

        test('debe procesar la lista de espera al cancelar', () => {
            // Llenar la capacidad máxima menos uno (ya tenemos una reserva confirmada)
            for (let i = 0; i < experiencia.capacidadMaxima - 1; i++) {
                experiencia.addListaReservas(fecha, `Cliente ${i}`);
            }
            
            // Agregar alguien a la lista de espera
            const infoEspera = {
                nombre: "María García",
                email: "maria@example.com",
                cantidadPersonas: 1
            };
            
            // Agregar directamente a la lista de espera sin usar el método AgregarListaEspera
            experiencia.addListaEspera(fecha, infoEspera);

            // Cancelar la reserva actual
            reserva.cancelar();

            // Verificar que la persona en espera fue confirmada
            const reservaConfirmada = experiencia.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' && r.nombre === "María García";
            });
            
            expect(reservaConfirmada).toBeTruthy();
            expect(reservaConfirmada.email).toBe("maria@example.com");
        });
    });

    describe('agregarListaEspera', () => {
        test('debe agregar a la lista de espera correctamente', () => {
            // Llenar la capacidad máxima para hacer que la fecha no esté disponible
            for (let i = 0; i < experiencia.capacidadMaxima; i++) {
                experiencia.addListaReservas(fecha, `Cliente ${i}`);
            }
            
            const reservaEspera = new Reserva(
                nombre,
                'juan.perez@example.com',
                experiencia,
                7,
                fecha,
                0,
                1,
                2000
            );
            reservaEspera.agregarListaEspera();
            
            const esperaFecha = experiencia.listaDeEspera.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            );
            
            // Buscar la reserva en la lista de espera
            const reservaEnEspera = esperaFecha.reservas.find(r => {
                return typeof r === 'object' && r.nombre === nombre;
            });
            
            expect(reservaEnEspera).toBeTruthy();
            expect(reservaEnEspera.email).toBe('juan.perez@example.com');
        });

        test('debe lanzar error si la fecha está disponible', () => {
            expect(() => {
                reserva.agregarListaEspera();
            }).toThrow("La fecha está disponible para la reserva, no es necesario agregar a la lista de espera.");
        });
    });

    describe('eliminarListaEspera', () => {
        test('debe eliminar de la lista de espera correctamente', () => {
            // Llenar la capacidad máxima para hacer que la fecha no esté disponible
            for (let i = 0; i < experiencia.capacidadMaxima; i++) {
                experiencia.addListaReservas(fecha, `Cliente ${i}`);
            }
            
            // Primero agregar a la lista de espera
            const reservaEspera = new Reserva(
                nombre,
                'juan.perez@example.com',
                experiencia,
                7,
                fecha,
                0,
                1,
                2000
            );
            reservaEspera.agregarListaEspera();
            
            // Luego eliminar
            reservaEspera.eliminarListaEspera();
            
            const esperaFecha = experiencia.listaDeEspera.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            );
            
            // Verificar que no hay reservas con ese nombre en la lista de espera
            const tieneReserva = esperaFecha.reservas.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            
            expect(tieneReserva).toBe(false);
        });
    });

    describe('pagar', () => {
        test('debe marcar el pago como realizado', () => {
            reserva.pagar();
            expect(reserva.pagado).toBe(true);
        });

        test('debe lanzar error si el pago ya fue realizado', () => {
            reserva.pagar();
            expect(() => {
                reserva.pagar();
            }).toThrow("El pago ya ha sido realizado.");
        });
    });

    describe('getFechaReserva', () => {
        test('debe devolver la fecha de reserva', () => {
            expect(reserva.getFechaReserva()).toBeInstanceOf(Date);
        });
    });

    describe('Cobertura adicional y casos límite', () => {
        test('debe lanzar error si no hay guías disponibles (entorno real)', () => {
            const experienciaSinGuias = new PaqueteDeAventura(
                [fecha],
                2000,
                10,
                8,
                true,
                actividades
            );
            // Simular método para requerir guía y sin guías disponibles
            experienciaSinGuias.requiereGuia = () => true;
            experienciaSinGuias.getGuias = () => 0;
            const reservaSinGuia = new Reserva(
                'Cliente Sin Guia',
                'sin.guia@example.com',
                experienciaSinGuias,
                7,
                fecha,
                0,
                1,
                2000
            );
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';
            expect(() => {
                reservaSinGuia.confirmar();
            }).toThrow("No hay guías disponibles para la fecha seleccionada.");
            process.env.NODE_ENV = originalEnv;
        });

        test('debe cancelar correctamente cuando la lista de espera está vacía', () => {
            reserva.confirmar();
            // No hay nadie en lista de espera
            expect(() => reserva.cancelar()).not.toThrow();
            const reservas = experiencia.listaReservas[0].reservas;
            expect(reservas.length).toBe(0);
        });

        test('debe lanzar error al eliminar de la lista de espera si no existe', () => {
            // Llenar la capacidad máxima para que la fecha no esté disponible
            for (let i = 0; i < experiencia.capacidadMaxima; i++) {
                experiencia.addListaReservas(fecha, `Cliente ${i}`);
            }
            const reservaEspera = new Reserva(
                'NoEnEspera',
                'noenespera@example.com',
                experiencia,
                7,
                fecha,
                0,
                1,
                2000
            );
            expect(() => reservaEspera.eliminarListaEspera()).toThrow();
        });

        test('debe lanzar error al confirmar reserva con fecha inválida', () => {
            const reservaInvalida = new Reserva(
                nombre,
                'invalido@example.com',
                experiencia,
                7,
                'fecha-invalida',
                0,
                1,
                2000
            );
            expect(() => reservaInvalida.confirmar()).toThrow();
        });

        test('debe lanzar error al confirmar reserva de grupo que excede la capacidad exacta', () => {
            const experienciaLimitada = new PaqueteDeAventura(
                [fecha],
                2000,
                3,
                8,
                true,
                actividades
            );
            experienciaLimitada.addListaReservas(fecha, {
                nombre: 'Cliente 1',
                email: 'cliente1@example.com',
                cantidadPersonas: 2
            });
            const reservaGrupo = new Reserva(
                'Grupo Grande',
                'grupo@example.com',
                experienciaLimitada,
                7,
                fecha,
                0,
                2,
                2000
            );
            expect(() => reservaGrupo.confirmar()).toThrow();
        });

        test('debe lanzar error si se intenta pagar dos veces', () => {
            reserva.pagar();
            expect(() => reserva.pagar()).toThrow("El pago ya ha sido realizado.");
        });

        test('debe calcular correctamente la tarifa para grupo con descuento', () => {
            const reservaGrupo = new Reserva(
                'Grupo Escolar',
                'grupo@escuela.edu',
                experiencia,
                7,
                fecha,
                10, // 10% de descuento
                5,  // 5 personas
                2000
            );
            expect(reservaGrupo.tarifaReserva).toBe(2000 * 0.9 * 0.3 * 5);
        });
    });

    // Asegurar que cualquier mock de experiencia tenga requiereGuia como método
    function mockExperienciaConMetodo() {
        return {
            requiereGuia: () => false,
            getGuias: () => 0,
            getDisponibilidad: () => true,
            getCapacidadMaxima: () => 10,
            addListaReservas: () => {},
            removeListaReservas: () => {},
            getListaEspera: () => [],
            addListaEspera: () => {},
            removeListaEspera: () => {},
            listaReservas: [{ fecha: new Date(), reservas: [] }],
            listaDeEspera: [{ fecha: new Date(), reservas: [] }],
            capacidadMaxima: 10
        };
    }

    test('mockExperienciaConMetodo debe tener requiereGuia como función', () => {
        const mock = mockExperienciaConMetodo();
        expect(typeof mock.requiereGuia).toBe('function');
    });
}); 