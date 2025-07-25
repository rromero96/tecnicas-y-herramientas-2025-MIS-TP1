import { PaqueteDeAventura } from '../paquete_de_aventura.js';

describe('PaqueteDeAventura', () => {
    let paquete;
    const fecha = "2024-04-01";
    const nombre = "Juan Pérez";
    const actividades = [
        { nombre: "Rafting", disponibilidad: [fecha] },
        { nombre: "Trekking", disponibilidad: [fecha] }
    ];

    beforeEach(() => {
        paquete = new PaqueteDeAventura(
            [fecha],
            2000,
            15,
            8,
            true,
            actividades
        );
    });

    describe('constructor', () => {
        test('debe inicializar correctamente los atributos', () => {
            expect(paquete.actividades).toEqual(actividades);
            expect(paquete.precioTotal).toBe(2000);
            expect(paquete.capacidadMaxima).toBe(15);
            expect(paquete.duracion).toBe(8);
            expect(paquete.requiereGuia()).toBe(true);
        });

        test('debe inicializar las listas de reservas', () => {
            expect(paquete.listaReservas).toHaveLength(1);
            expect(paquete.listaReservas[0].fecha).toBeInstanceOf(Date);
            expect(paquete.listaReservas[0].reservas).toEqual([]);
        });
    });

    describe('GetActividades', () => {
        test('debe devolver los nombres de las actividades', () => {
            const nombres = paquete.GetActividades();
            expect(nombres).toEqual(["Rafting", "Trekking"]);
        });

        test('debe devolver array vacío si no hay actividades', () => {
            const paqueteSinActividades = new PaqueteDeAventura(
                [fecha],
                2000,
                15,
                8,
                true,
                []
            );
            expect(paqueteSinActividades.GetActividades()).toEqual([]);
        });
    });

    describe('getDisponibilidad', () => {
        test('debe devolver true cuando todas las actividades están disponibles', () => {
            expect(paquete.getDisponibilidad(fecha)).toBe(true);
        });

        test('debe devolver false cuando alguna actividad no está disponible', () => {
            const paqueteConActividadNoDisponible = new PaqueteDeAventura(
                [fecha],
                2000,
                15,
                8,
                true,
                [
                    { nombre: "Rafting", disponibilidad: [fecha] },
                    { nombre: "Trekking", disponibilidad: ["2024-04-02"] }
                ]
            );
            expect(paqueteConActividadNoDisponible.getDisponibilidad(fecha)).toBe(false);
        });

        test('debe devolver false para una fecha inválida', () => {
            expect(paquete.getDisponibilidad("fecha-invalida")).toBe(false);
        });

        test('debe devolver false cuando se alcanza la capacidad máxima', () => {
            // Llenar la capacidad máxima
            for (let i = 0; i < paquete.capacidadMaxima; i++) {
                paquete.addListaReservas(fecha, `Cliente ${i}`);
            }
            expect(paquete.getDisponibilidad(fecha)).toBe(false);
        });
    });

    describe('agregarFechaEnDisponibilidad', () => {
        test('debe agregar una nueva fecha a todas las actividades', () => {
            const nuevaFecha = "2024-04-02";
            paquete.agregarFechaEnDisponibilidad(nuevaFecha);
            
            paquete.actividades.forEach(actividad => {
                expect(actividad.disponibilidad).toContain(nuevaFecha);
            });
        });

        test('debe lanzar error al agregar una fecha inválida', () => {
            expect(() => {
                paquete.agregarFechaEnDisponibilidad("fecha-invalida");
            }).toThrow("La fecha proporcionada no es válida");
        });

        test('debe lanzar error al agregar una fecha que ya existe', () => {
            expect(() => {
                paquete.agregarFechaEnDisponibilidad(fecha);
            }).toThrow("La fecha ya está registrada en la disponibilidad");
        });

        test('debe agregar la fecha a la lista de reservas y espera', () => {
            const nuevaFecha = "2024-04-02";
            paquete.agregarFechaEnDisponibilidad(nuevaFecha);
            
            const fechaEnListaReservas = paquete.listaReservas.some(
                reserva => reserva.fecha.getTime() === new Date(nuevaFecha).getTime()
            );
            expect(fechaEnListaReservas).toBe(true);
        });
    });

    describe('addListaReservas y removeListaReservas', () => {
        test('debe agregar y remover reservas correctamente', () => {
            paquete.addListaReservas(fecha, nombre);
            
            // Verificar que la reserva se agregó correctamente
            const reservaAgregada = paquete.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(reservaAgregada).toBeTruthy();

            paquete.removeListaReservas(fecha, nombre);
            
            // Verificar que la reserva se eliminó correctamente
            const reservaEliminada = paquete.listaReservas[0].reservas.find(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(reservaEliminada).toBeFalsy();
        });

        test('debe lanzar error al agregar reserva en fecha no disponible', () => {
            expect(() => {
                paquete.addListaReservas("2024-04-02", nombre);
            }).toThrow("La fecha no está registrada en la lista de reservas.");
        });

        test('debe lanzar error al remover reserva inexistente', () => {
            expect(() => {
                paquete.removeListaReservas(fecha, "Nombre inexistente");
            }).toThrow("El nombre no se encuentra en la lista de reservas.");
        });
    });

    describe('Manejo de actividades', () => {
        test('debe mantener la consistencia de las actividades al agregar fecha', () => {
            const nuevaFecha = "2024-04-02";
            paquete.agregarFechaEnDisponibilidad(nuevaFecha);
            
            // Verificar que todas las actividades tienen la misma disponibilidad
            const disponibilidadActividades = paquete.actividades.map(a => a.disponibilidad);
            const todasMismaDisponibilidad = disponibilidadActividades.every(
                (disp, _, arr) => disp.length === arr[0].length && 
                disp.every((f, i) => f === arr[0][i])
            );
            expect(todasMismaDisponibilidad).toBe(true);
        });

        test('debe mantener la consistencia de las actividades al agregar reserva', () => {
            paquete.addListaReservas(fecha, nombre);
            expect(paquete.getDisponibilidad(fecha)).toBe(true);
        });
    });
}); 