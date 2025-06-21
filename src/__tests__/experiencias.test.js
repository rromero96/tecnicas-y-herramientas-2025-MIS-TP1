import { ExperienciaTuristica, TipoEstrategia } from '../experiencias.js';
import { ExcursionGuiada } from '../excursion_guiada.js';
import { PaqueteDeAventura } from '../paquete_de_aventura.js';

describe('ExperienciaTuristica', () => {
    test('no se puede instanciar directamente', () => {
        expect(() => {
            new ExperienciaTuristica([], 100, 10, 2, true, TipoEstrategia.DEFAULT);
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

    describe('getGuias', () => {
        test('debe devolver el número correcto de guías', () => {
            expect(excursion.getGuias()).toBe(2);
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

    describe('getDisponibilidad - casos adicionales', () => {
        test('debe devolver false cuando se alcanza la capacidad máxima', () => {
            // Llenar la capacidad máxima
            for (let i = 0; i < paquete.capacidadMaxima; i++) {
                paquete.addListaReservas(fecha, {
                    nombre: `Cliente ${i}`,
                    email: `cliente${i}@example.com`,
                    cantidadPersonas: 1
                });
            }
            
            expect(paquete.getDisponibilidad(fecha)).toBe(false);
        });

        test('debe manejar correctamente fechas en diferentes formatos', () => {
            const fechaAlternativa = "01/04/2024";
            paquete.agregarFechaEnDisponibilidad(fechaAlternativa);
            
            expect(paquete.getDisponibilidad(fechaAlternativa)).toBe(true);
        });
    });
});

describe('Cobertura adicional y casos límite en Experiencias', () => {
    const fecha = "2024-04-01";
    test('debe lanzar error al llamar métodos abstractos de la clase base', () => {
        class Dummy extends ExperienciaTuristica {}
        const dummy = Object.create(ExperienciaTuristica.prototype);
        expect(() => dummy.getDisponibilidad('2024-04-01')).toThrow();
        expect(() => dummy.agregarFechaEnDisponibilidad('2024-04-01')).toThrow();
    });

    test('debe lanzar error al agregar fecha inválida en subclase', () => {
        const excursion = new ExcursionGuiada([
            fecha
        ], 1000, 20, 4, true, 2);
        expect(() => excursion.agregarFechaEnDisponibilidad('fecha-invalida')).toThrow('La fecha proporcionada no es válida');
    });

    test('debe lanzar error al agregar fecha repetida en subclase', () => {
        const excursion = new ExcursionGuiada([
            fecha
        ], 1000, 20, 4, true, 2);
        expect(() => excursion.agregarFechaEnDisponibilidad(fecha)).toThrow('La fecha ya está registrada en la disponibilidad');
    });

    test('debe agregar y remover reservas con datos atípicos', () => {
        const excursion = new ExcursionGuiada([
            fecha
        ], 1000, 20, 4, true, 2);
        // Sin nombre
        expect(() => excursion.addListaReservas(fecha, { cantidadPersonas: 1 })).not.toThrow();
        // Sin cantidadPersonas
        expect(() => excursion.addListaReservas(fecha, { nombre: 'SinCantidad' })).not.toThrow();
        // Remover reserva sin nombre
        expect(() => excursion.removeListaReservas(fecha, 'SinCantidad')).not.toThrow();
    });
}); 

describe('Estrategias de Lista de Espera', () => {
    const fecha = "2024-04-01";
    
    test('debe configurar y obtener correctamente la estrategia de lista de espera Default', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );

        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.DEFAULT);
    });

    test('debe configurar y obtener correctamente la estrategia de lista de espera Orden de Llegada Estricto', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.ORDEN_LLEGADA_ESTRICTO
        );

        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
    });

    test('debe configurar y obtener correctamente la estrategia de lista de espera Completado Eficiente', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.COMPLETADO_EFICIENTE
        );

        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.COMPLETADO_EFICIENTE);
    });

    test('debe modificar correctamente la estrategia de lista de espera a Orden de Llegada Estricto', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );
        
        excursion.setEstrategiaListaEspera(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
    });

    test('debe modificar correctamente la estrategia de lista de espera a Completado Eficiente', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );
        
        excursion.setEstrategiaListaEspera(TipoEstrategia.COMPLETADO_EFICIENTE);
        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.COMPLETADO_EFICIENTE);
    });
    test('debe modificar correctamente la estrategia de lista de espera a Default', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.COMPLETADO_EFICIENTE
        );
        
        excursion.setEstrategiaListaEspera(TipoEstrategia.DEFAULT);
        expect(excursion.getEstrategiaListaEspera()).toBe(TipoEstrategia.DEFAULT);
    });
});