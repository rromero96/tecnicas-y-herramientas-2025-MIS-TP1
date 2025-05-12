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
            experiencia,
            7,
            fecha,
            0,
            false,
            2000
        );
    });

    describe('constructor', () => {
        test('debe inicializar correctamente los atributos', () => {
            expect(reserva.nombre).toBe(nombre);
            expect(reserva.experiencia).toBe(experiencia);
            expect(reserva.fecha).toBe(fecha);
            expect(reserva.fechaReserva).toBeInstanceOf(Date);
            expect(reserva.descuentoGrupal).toBe(0);
            expect(reserva.tarifaReserva).toBe(600); // 2000 * 0.3
            expect(reserva.isGrupo).toBe(false);
            expect(reserva.pago).toBe(false);
            expect(reserva.plazoLimite).toBe(7);
        });

        test('debe lanzar error si la experiencia no es válida', () => {
            expect(() => {
                new Reserva(nombre, {}, 7, fecha, 0, false, 2000);
            }).toThrow("El atributo 'experiencia' debe ser una instancia de ExperienciaTuristica o sus clases derivadas.");
        });
    });

    describe('Confirmar', () => {
        test('debe confirmar la reserva correctamente', () => {
            reserva.Confirmar();
            expect(experiencia.listaReservas[0].reservas).toContain(nombre);
        });

        test('debe lanzar error si la fecha no está disponible', () => {
            const reservaFechaNoDisponible = new Reserva(
                nombre,
                experiencia,
                7,
                "2024-04-02",
                0,
                false,
                2000
            );
            expect(() => {
                reservaFechaNoDisponible.Confirmar();
            }).toThrow("La fecha no está disponible para la reserva, puede sumarse a la lista de espera.");
        });
    });

    describe('Cancelar', () => {
        beforeEach(() => {
            reserva.Confirmar();
        });

        test('debe cancelar la reserva correctamente', () => {
            reserva.Cancelar();
            expect(experiencia.listaReservas[0].reservas).not.toContain(nombre);
        });

        test('debe procesar la lista de espera al cancelar', () => {
            // Llenar la capacidad máxima menos uno (ya tenemos una reserva confirmada)
            for (let i = 0; i < experiencia.capacidadMaxima - 1; i++) {
                experiencia.AddListaReservas(fecha, `Cliente ${i}`);
            }
            
            // Agregar alguien a la lista de espera
            const reservaEspera = new Reserva(
                "María García",
                experiencia,
                7,
                fecha,
                0,
                false,
                2000
            );
            // Agregar directamente a la lista de espera sin usar el método AgregarListaEspera
            experiencia.AddListaEspera(fecha, "María García");

            // Cancelar la reserva actual
            reserva.Cancelar();

            // Verificar que la persona en espera fue confirmada
            expect(experiencia.listaReservas[0].reservas).toContain("María García");
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
                experiencia,
                7,
                fecha,
                0,
                false,
                2000
            );
            reservaEspera.AgregarListaEspera();
            
            const esperaFecha = experiencia.listaDeEspera.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            );
            expect(esperaFecha.reservas).toContain(nombre);
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
                experiencia,
                7,
                fecha,
                0,
                false,
                2000
            );
            reservaEspera.AgregarListaEspera();
            
            // Luego eliminar
            reservaEspera.EliminarListaEspera();
            
            const esperaFecha = experiencia.listaDeEspera.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            );
            expect(esperaFecha.reservas).not.toContain(nombre);
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