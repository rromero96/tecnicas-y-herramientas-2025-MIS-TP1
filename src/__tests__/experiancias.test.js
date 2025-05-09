import { ExperienciaTuristica } from '../experiencias.js';
import { ExcursionGuiada } from '../excursion_guiada.js';
import { PaqueteDeAventura } from '../paquete_de_aventura.js';

describe('ExperienciaTuristica', () => {
    test('no se puede instanciar directamente', () => {
        expect(() => {
            new ExperienciaTuristica([], 100, 10, 2, true);
        }).toThrow("ExperienciaTuristica es una clase abstracta y no puede ser instanciada directamente.");
    });
});

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

    describe('GetGuias', () => {
        test('debe devolver el número correcto de guías', () => {
            expect(excursion.GetGuias()).toBe(2);
        });
    });

    describe('GetDisponibilidad', () => {
        test('debe devolver true para una fecha disponible y con capacidad', () => {
            expect(excursion.GetDisponibilidad(fecha)).toBe(true);
        });

        test('debe devolver false para una fecha no disponible', () => {
            expect(excursion.GetDisponibilidad("2024-04-02")).toBe(false);
        });

        test('debe devolver false para una fecha inválida', () => {
            expect(excursion.GetDisponibilidad("fecha-invalida")).toBe(false);
        });
    });

    describe('AddListaReservas y RemoveListaReservas', () => {
        test('debe agregar y remover reservas correctamente', () => {
            excursion.AddListaReservas(fecha, nombre);
            expect(excursion.listaReservas[0].reservas).toContain(nombre);

            excursion.RemoveListaReservas(fecha, nombre);
            expect(excursion.listaReservas[0].reservas).not.toContain(nombre);
        });

        test('debe lanzar error al agregar reserva en fecha no disponible', () => {
            expect(() => {
                excursion.AddListaReservas("2024-04-02", nombre);
            }).toThrow("La fecha no está registrada en la lista de reservas.");
        });

        test('debe lanzar error al remover reserva inexistente', () => {
            expect(() => {
                excursion.RemoveListaReservas(fecha, "Nombre inexistente");
            }).toThrow("El nombre no se encuentra en la lista de reservas.");
        });
    });
});

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
            expect(paquete.requiereGuia).toBe(true);
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
    });

    describe('GetDisponibilidad', () => {
        test('debe devolver true cuando todas las actividades están disponibles', () => {
            expect(paquete.GetDisponibilidad(fecha)).toBe(true);
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
            expect(paqueteConActividadNoDisponible.GetDisponibilidad(fecha)).toBe(false);
        });

        test('debe devolver false para una fecha inválida', () => {
            expect(paquete.GetDisponibilidad("fecha-invalida")).toBe(false);
        });
    });

    describe('AddListaReservas y RemoveListaReservas', () => {
        test('debe agregar y remover reservas correctamente', () => {
            paquete.AddListaReservas(fecha, nombre);
            expect(paquete.listaReservas[0].reservas).toContain(nombre);

            paquete.RemoveListaReservas(fecha, nombre);
            expect(paquete.listaReservas[0].reservas).not.toContain(nombre);
        });

        test('debe lanzar error al agregar reserva en fecha no disponible', () => {
            expect(() => {
                paquete.AddListaReservas("2024-04-02", nombre);
            }).toThrow("La fecha no está registrada en la lista de reservas.");
        });

        test('debe lanzar error al remover reserva inexistente', () => {
            expect(() => {
                paquete.RemoveListaReservas(fecha, "Nombre inexistente");
            }).toThrow("El nombre no se encuentra en la lista de reservas.");
        });
    });
}); 