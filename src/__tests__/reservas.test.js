import { Reserva } from '../reservas.js';
import { PaqueteDeAventura } from '../paquete_de_aventura.js';

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
            actividades
        );
        reserva = new Reserva(
            nombre,
            'juan.perez@example.com',
            experiencia,
            7,
            fecha,
            0,
            1,
            2000
        );
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
            expect(reserva.pago).toBe(false);
            expect(reserva.plazoLimite).toBe(7);
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

    describe('Confirmar', () => {
        test('debe confirmar la reserva correctamente', () => {
            reserva.Confirmar();
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
                reservaFechaNoDisponible.Confirmar();
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
            expect(experienciaLimitada.GetCapacidadMaxima()).toBe(3);
            
            // Crear una reserva que ocupe toda la capacidad disponible
            experienciaLimitada.AddListaReservas(fecha, {
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
                reservaExcesiva.Confirmar();
            }).toThrow();
        });
    });

    describe('Cancelar', () => {
        beforeEach(() => {
            reserva.Confirmar();
        });

        test('debe cancelar la reserva correctamente', () => {
            reserva.Cancelar();
            // Verificar que no hay reservas con ese nombre
            const tieneReserva = experiencia.listaReservas[0].reservas.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(tieneReserva).toBe(false);
        });

        test('debe procesar la lista de espera al cancelar', () => {
            // Llenar la capacidad máxima menos uno (ya tenemos una reserva confirmada)
            for (let i = 0; i < experiencia.capacidadMaxima - 1; i++) {
                experiencia.AddListaReservas(fecha, `Cliente ${i}`);
            }
            
            // Agregar alguien a la lista de espera
            const infoEspera = {
                nombre: "María García",
                email: "maria@example.com",
                cantidadPersonas: 1
            };
            
            // Agregar directamente a la lista de espera sin usar el método AgregarListaEspera
            experiencia.AddListaEspera(fecha, infoEspera);

            // Cancelar la reserva actual
            reserva.Cancelar();

            // Verificar que la persona en espera fue confirmada
            const reservaConfirmada = experiencia.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' && r.nombre === "María García";
            });
            
            expect(reservaConfirmada).toBeTruthy();
            expect(reservaConfirmada.email).toBe("maria@example.com");
        });
        
        test('debe manejar correctamente la lista de espera con diferentes tamaños de grupo', () => {
            // Crear una experiencia con capacidad limitada
            const experienciaLimitada = new PaqueteDeAventura(
                [fecha],
                2000,
                10, // Capacidad máxima de 10 personas
                8,
                true,
                actividades
            );
            
            // Agregar una reserva de 5 personas
            const reservaGrande = new Reserva(
                'Grupo Grande',
                'grupo@example.com',
                experienciaLimitada,
                7,
                fecha,
                0,
                5,
                2000
            );
            reservaGrande.Confirmar();
            
            // Agregar varias reservas a la lista de espera
            experienciaLimitada.AddListaEspera(fecha, {
                nombre: "Grupo 1",
                email: "grupo1@example.com",
                cantidadPersonas: 4
            });
            
            experienciaLimitada.AddListaEspera(fecha, {
                nombre: "Grupo 2",
                email: "grupo2@example.com",
                cantidadPersonas: 2
            });
            
            experienciaLimitada.AddListaEspera(fecha, {
                nombre: "Grupo 3",
                email: "grupo3@example.com",
                cantidadPersonas: 3
            });
            
            // Cancelar la reserva grande (libera 5 cupos)
            reservaGrande.Cancelar();
            
            // Verificar que se confirmaron las reservas que caben en los cupos liberados
            // Debería confirmar Grupo 2 (2 personas) y Grupo 3 (3 personas) = 5 personas en total
            const reservasConfirmadas = experienciaLimitada.listaReservas[0].reservas;
            
            const tieneGrupo2 = reservasConfirmadas.some(r => typeof r === 'object' && r.nombre === "Grupo 2");
            const tieneGrupo3 = reservasConfirmadas.some(r => typeof r === 'object' && r.nombre === "Grupo 3");
            
            expect(tieneGrupo2).toBe(true);
            expect(tieneGrupo3).toBe(true);
            
            // Grupo 1 debería seguir en lista de espera porque requiere 4 personas
            const listaEspera = experienciaLimitada.GetListaEspera(fecha);
            const grupo1EnEspera = listaEspera.some(r => typeof r === 'object' && r.nombre === "Grupo 1");
            
            expect(grupo1EnEspera).toBe(true);
        });
    });

    describe('AgregarListaEspera', () => {
        test('debe agregar a la lista de espera correctamente', () => {
            // Llenar la capacidad máxima para hacer que la fecha no esté disponible
            for (let i = 0; i < experiencia.capacidadMaxima; i++) {
                experiencia.AddListaReservas(fecha, `Cliente ${i}`);
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
            reservaEspera.AgregarListaEspera();
            
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
                reserva.AgregarListaEspera();
            }).toThrow("La fecha está disponible para la reserva, no es necesario agregar a la lista de espera.");
        });
    });

    describe('EliminarListaEspera', () => {
        test('debe eliminar de la lista de espera correctamente', () => {
            // Llenar la capacidad máxima para hacer que la fecha no esté disponible
            for (let i = 0; i < experiencia.capacidadMaxima; i++) {
                experiencia.AddListaReservas(fecha, `Cliente ${i}`);
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
            reservaEspera.AgregarListaEspera();
            
            // Luego eliminar
            reservaEspera.EliminarListaEspera();
            
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

    describe('Pago', () => {
        test('debe marcar el pago como realizado', () => {
            reserva.Pago();
            expect(reserva.pago).toBe(true);
        });

        test('debe lanzar error si el pago ya fue realizado', () => {
            reserva.Pago();
            expect(() => {
                reserva.Pago();
            }).toThrow("El pago ya ha sido realizado.");
        });
    });

    describe('GetFechaReserva', () => {
        test('debe devolver la fecha de reserva', () => {
            expect(reserva.GetFechaReserva()).toBeInstanceOf(Date);
        });
    });
}); 