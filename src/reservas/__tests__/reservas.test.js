import { Reserva } from '../reservas.js';
import { PaqueteDeAventura } from '../../experiencias/paquete_de_aventura.js';
import { TipoEstrategia } from '../../experiencias/experiencias.js';

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
            2000,
            {
                descuentoGrupal: 0,
                cantidadPersonas: 1,
                datosPago: {
                    cuit: '20329642330',
                    banco: 'Banco Nación',
                    titular: nombre
                }
            }
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
                new Reserva(nombre, 'email@example.com', {}, 7, fecha, 2000, {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                });
            }).toThrow("El atributo 'experiencia' debe ser una instancia de ExperienciaTuristica o sus clases derivadas.");
        });
        
        test('debe calcular correctamente la tarifa para grupos', () => {
            const reservaGrupo = new Reserva(
                'Grupo Escolar',
                'grupo@escuela.edu',
                experiencia,
                7,
                fecha,
                2000,
                {
                    descuentoGrupal: 10, // 10% de descuento
                    cantidadPersonas: 5,  // 5 personas
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: 'Grupo Escolar'
                    }
                }
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
        });

        test('debe lanzar error si la fecha no está disponible', () => {
            const experienciaNoDisponible = mockExperienciaConMetodo();
            experienciaNoDisponible.getDisponibilidad = () => false;
            
            const reservaFechaNoDisponible = new Reserva(
                nombre,
                'juan.perez@example.com',
                experienciaNoDisponible,
                7,
                fecha,
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                }
            );
            
            expect(() => reservaFechaNoDisponible.confirmar()).toThrow(
                "La fecha no está disponible para la reserva, puede sumarse a la lista de espera."
            );
        });

        test('debe lanzar error si no hay suficiente capacidad para el grupo', () => {
            const experienciaCapacidadLimitada = mockExperienciaConMetodo();
            // Configurar que la fecha esté disponible pero la capacidad sea 3
            experienciaCapacidadLimitada.getDisponibilidad = () => true;
            experienciaCapacidadLimitada.getCapacidadMaxima = () => 3;
            experienciaCapacidadLimitada.listaReservas = [{
                fecha: new Date(fecha),
                reservas: [
                    { nombre: "Cliente A", cantidadPersonas: 2 }
                ]
            }];
            
            const reservaExcesiva = new Reserva(
                nombre,
                'juan.perez@example.com',
                experienciaCapacidadLimitada,
                7,
                fecha,
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 2,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                }
            );
            
            expect(() => reservaExcesiva.confirmar()).toThrow(
                "No hay suficiente capacidad para un grupo de 2 personas. Puede sumarse a la lista de espera."
            );
        });
    });

    describe('cancelar', () => {
        test('debe cancelar la reserva correctamente', () => {
            reserva.confirmar();
            reserva.cancelar();
            const reservas = experiencia.listaReservas[0].reservas;
            expect(reservas.length).toBe(0);
        });

        test('debe procesar la lista de espera al cancelar', () => {
            reserva.confirmar();
            // Agregar una reserva a la lista de espera
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: 'Cliente Sin Guia'
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: 'NoEnEspera'
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 1,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: nombre
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 0,
                    cantidadPersonas: 2,
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: 'Grupo Grande'
                    }
                }
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
                2000,
                {
                    descuentoGrupal: 10, // 10% de descuento
                    cantidadPersonas: 5,  // 5 personas
                    datosPago: {
                        cuit: '20329642330',
                        banco: 'Banco Nación',
                        titular: 'Grupo Escolar'
                    }
                }
            );
            expect(reservaGrupo.tarifaReserva).toBe(2000 * 0.9 * 0.3 * 5);
        });
    });

    function mockExperienciaConMetodo() {
        const mock = new PaqueteDeAventura(
            [fecha],
            2000,
            10,
            8,
            true,
            actividades
        );
        
        mock.getDisponibilidad = () => true;
        mock.getCapacidadMaxima = () => 10;
        mock.requiereGuia = () => false;
        mock.getGuias = () => 0;
        
        return mock;
    }

    test('mockExperienciaConMetodo debe tener requiereGuia como función', () => {
        const mock = mockExperienciaConMetodo();
        expect(typeof mock.requiereGuia).toBe('function');
    });
});
