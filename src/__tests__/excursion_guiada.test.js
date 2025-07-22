import { ExcursionGuiada } from '../experiencias/excursion_guiada.js';

describe('ExcursionGuiada', () => {
    let excursion;
    const fecha = "2024-04-01";
    const nombre = "Juan Pérez";

    beforeEach(() => {
        excursion = new ExcursionGuiada(
            [fecha],
            1000,
            20,
            4,
            true,
            2
        );
    });

    describe('constructor', () => {
        test('debe inicializar correctamente los atributos', () => {
            expect(excursion.guias).toBe(2);
            expect(excursion.precioTotal).toBe(1000);
            expect(excursion.capacidadMaxima).toBe(20);
            expect(excursion.duracion).toBe(4);
            expect(excursion.requiereGuia).toBe(true);
        });

        test('debe inicializar las listas de reservas', () => {
            expect(excursion.listaReservas).toHaveLength(1);
            expect(excursion.listaReservas[0].fecha).toBeInstanceOf(Date);
            expect(excursion.listaReservas[0].reservas).toEqual([]);
        });
    });

    describe('getGuias', () => {
        test('debe devolver el número correcto de guías', () => {
            expect(excursion.getGuias()).toBe(2);
        });

        test('debe devolver 0 cuando no hay guías', () => {
            const excursionSinGuias = new ExcursionGuiada(
                [fecha],
                1000,
                20,
                4,
                true,
                0
            );
            expect(excursionSinGuias.getGuias()).toBe(0);
        });
    });

    describe('getDisponibilidad', () => {
        test('debe devolver true para una fecha disponible y con capacidad', () => {
            expect(excursion.getDisponibilidad(fecha)).toBe(true);
        });

        test('debe devolver false para una fecha no disponible', () => {
            expect(excursion.getDisponibilidad("2024-04-02")).toBe(false);
        });

        test('debe devolver false para una fecha inválida', () => {
            expect(excursion.getDisponibilidad("fecha-invalida")).toBe(false);
        });

        test('debe devolver false cuando se alcanza la capacidad máxima', () => {
            // Llenar la capacidad máxima
            for (let i = 0; i < excursion.capacidadMaxima; i++) {
                excursion.addListaReservas(fecha, `Cliente ${i}`);
            }
            expect(excursion.getDisponibilidad(fecha)).toBe(false);
        });
    });

    describe('agregarFechaEnDisponibilidad', () => {
        test('debe agregar una nueva fecha correctamente', () => {
            const nuevaFecha = "2024-04-02";
            excursion.agregarFechaEnDisponibilidad(nuevaFecha);
            
            expect(excursion.disponibilidad).toContain(nuevaFecha);
            expect(excursion.listaReservas).toHaveLength(2);
            expect(excursion.listaDeEspera).toHaveLength(2);
        });

        test('debe lanzar error al agregar una fecha inválida', () => {
            expect(() => {
                excursion.agregarFechaEnDisponibilidad("fecha-invalida");
            }).toThrow("La fecha proporcionada no es válida");
        });

        test('debe lanzar error al agregar una fecha que ya existe', () => {
            expect(() => {
                excursion.agregarFechaEnDisponibilidad(fecha);
            }).toThrow("La fecha ya está registrada en la disponibilidad");
        });

        test('debe agregar la fecha a las listas de reservas y espera', () => {
            const nuevaFecha = "2024-04-02";
            excursion.agregarFechaEnDisponibilidad(nuevaFecha);
            
            const fechaEnListaReservas = excursion.listaReservas.some(
                reserva => reserva.fecha.getTime() === new Date(nuevaFecha).getTime()
            );
            const fechaEnListaEspera = excursion.listaDeEspera.some(
                espera => espera.fecha.getTime() === new Date(nuevaFecha).getTime()
            );
            
            expect(fechaEnListaReservas).toBe(true);
            expect(fechaEnListaEspera).toBe(true);
        });
    });

    describe('addListaReservas y removeListaReservas', () => {
        test('debe agregar y remover reservas correctamente', () => {
            excursion.addListaReservas(fecha, nombre);
            
            // Verificar que la reserva se agregó correctamente
            const reservaAgregada = excursion.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(reservaAgregada).toBeTruthy();

            excursion.removeListaReservas(fecha, nombre);
            
            // Verificar que la reserva se eliminó correctamente
            const reservaEliminada = excursion.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(reservaEliminada).toBeFalsy();
        });

        test('debe lanzar error al agregar reserva en fecha no disponible', () => {
            expect(() => {
                excursion.addListaReservas("2024-04-02", nombre);
            }).toThrow("La fecha no está registrada en la lista de reservas.");
        });

        test('debe lanzar error al remover reserva inexistente', () => {
            expect(() => {
                excursion.removeListaReservas(fecha, "Nombre inexistente");
            }).toThrow("El nombre no se encuentra en la lista de reservas.");
        });
    });
}); 