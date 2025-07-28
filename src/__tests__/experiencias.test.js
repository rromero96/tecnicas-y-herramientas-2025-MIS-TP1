/**
 * Pruebas para las clases de experiencias turísticas
 * Actualizado para usar la nueva estructura de arquitectura limpia
 */
import { TipoEstrategia } from '../infrastructure/strategies/ListaEsperaStrategyFactory.js';
import { ExcursionGuiada } from '../domain/entities/ExcursionGuiada.js';
import { PaqueteDeAventura } from '../domain/entities/PaqueteDeAventura.js';
import { ExperienciaTuristica as ExperienciaTuristicaAbstracta } from '../domain/entities/ExperienciaTuristica.js';

describe('ExperienciaTuristica', () => {
    test('no se puede instanciar directamente', () => {
        expect(() => {
            new ExperienciaTuristicaAbstracta(['2024-04-01'], 100, 10, 2, true, TipoEstrategia.DEFAULT);
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
            expect(excursion.requiereGuia()).toBe(true);
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
    test('debe lanzar error al llamar métodos abstractos de la clase base', () => {
        // Crear una instancia mock de ExperienciaTuristica
        class MockExperiencia extends ExperienciaTuristicaAbstracta {
            constructor() {
                super(['2024-04-01'], 1000, 10, 4, false);
            }
        }
        
        const mock = new MockExperiencia();
        
        // Estos métodos deben lanzar errores porque son abstractos
        expect(() => mock.getDisponibilidad('2024-04-01')).toThrow("El método 'Disponibilidad' debe ser implementado por la clase hija.");
        expect(() => mock.agregarFechaEnDisponibilidad('2024-04-02')).toThrow("El método 'AgregarDisponibilidad' debe ser implementado por la clase hija.");
    });

    test('debe lanzar error al agregar fecha inválida en subclase', () => {
        const paquete = new PaqueteDeAventura(['2024-04-01'], 1000, 10, 4, false, []);
        expect(() => paquete.agregarFechaEnDisponibilidad('fecha-invalida')).toThrow('La fecha proporcionada no es válida');
    });

    test('debe lanzar error al agregar fecha repetida en subclase', () => {
        const paquete = new PaqueteDeAventura(['2024-04-01'], 1000, 10, 4, false, []);
        expect(() => paquete.agregarFechaEnDisponibilidad('2024-04-01')).toThrow('La fecha ya está registrada en la disponibilidad');
    });

    test('debe agregar y remover reservas con datos atípicos', () => {
        const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
        
        // Agregar reserva con objeto complejo
        excursion.addListaReservas('2024-04-01', { nombre: 'Cliente Test', cantidadPersonas: 2 });
        
        // Remover la reserva
        excursion.removeListaReservas('2024-04-01', 'Cliente Test');
        
        const reservas = excursion.listaReservas.find(r => r.fecha.getTime() === new Date('2024-04-01').getTime()).reservas;
        expect(reservas).toHaveLength(0);
    });

    test('debe lanzar error al remover reserva de fecha no registrada', () => {
        const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
        
        // Intentar remover de una fecha que no está en la lista de reservas
        expect(() => {
            excursion.removeListaReservas('2024-05-01', 'Cliente Test');
        }).toThrow('La fecha no está registrada en la lista de reservas.');
    });
}); 

describe('Estrategias de Lista de Espera', () => {
    const fecha = "2024-04-01";
    
    test('debe configurar y obtener correctamente la estrategia de lista de espera Default', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );

        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.DEFAULT);
    });

    test('debe configurar y obtener correctamente la estrategia de lista de espera Orden de Llegada Estricto', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.ORDEN_LLEGADA_ESTRICTO
        );

        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
    });

    test('debe configurar y obtener correctamente la estrategia de lista de espera Completado Eficiente', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.COMPLETADO_EFICIENTE
        );

        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.COMPLETADO_EFICIENTE);
    });

    test('debe modificar correctamente la estrategia de lista de espera a Orden de Llegada Estricto', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );
        
        excursion.setEstrategiaListaDeEspera(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.ORDEN_LLEGADA_ESTRICTO);
    });

    test('debe modificar correctamente la estrategia de lista de espera a Completado Eficiente', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.DEFAULT
        );
        
        excursion.setEstrategiaListaDeEspera(TipoEstrategia.COMPLETADO_EFICIENTE);
        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.COMPLETADO_EFICIENTE);
    });
    
    test('debe modificar correctamente la estrategia de lista de espera a Default', () => {
        const excursion = new ExcursionGuiada(
            [fecha],
            1000, 20, 4, true, 2, TipoEstrategia.COMPLETADO_EFICIENTE
        );
        
        excursion.setEstrategiaListaDeEspera(TipoEstrategia.DEFAULT);
        expect(excursion.getTipoEstrategia()).toBe(TipoEstrategia.DEFAULT);
    });

    test('debe obtener correctamente la estrategia de lista de espera', () => {
        const paquete = new PaqueteDeAventura(['2024-04-01'], 1000, 10, 4, false, [], 'default');
        expect(paquete.getEstrategiaListaDeEspera()).toBeDefined();
        expect(paquete.getTipoEstrategia()).toBe('default');
    });

    // Tests adicionales para mejorar cobertura de ramas en ExperienciaTuristica
    describe('Cobertura de ramas adicional para ExperienciaTuristica', () => {
        test('debe manejar removeListaReservas con reserva como string simple', () => {
            const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            
            // Agregar reserva como string simple
            excursion.addListaReservas('2024-04-01', 'Cliente String');
            
            // Remover reserva que es string simple (cubre la rama else en línea 96)
            expect(() => excursion.removeListaReservas('2024-04-01', 'Cliente String')).not.toThrow();
        });

        test('debe manejar addListaEspera con diferentes tipos de reservaInfo', () => {
            const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            
            // Agregar como string (cubre la rama else en línea 133)
            excursion.addListaEspera('2024-04-01', 'Cliente String');
            
            // Agregar como objeto (cubre la rama if en línea 133)
            excursion.addListaEspera('2024-04-01', { nombre: 'Cliente Objeto', cantidadPersonas: 2 });
            
            const listaEspera = excursion.getListaEspera('2024-04-01');
            expect(listaEspera).toHaveLength(2);
        });

        test('debe manejar removeListaEspera con reserva como string simple', () => {
            const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            
            // Agregar reserva como string
            excursion.addListaEspera('2024-04-01', 'Cliente String');
            
            // Remover reserva que es string simple (cubre la rama else en línea 152)
            expect(() => excursion.removeListaEspera('2024-04-01', 'Cliente String')).not.toThrow();
        });

        test('debe manejar removeListaEspera con reserva como objeto', () => {
            const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            
            // Agregar reserva como objeto
            excursion.addListaEspera('2024-04-01', { nombre: 'Cliente Objeto', cantidadPersonas: 2 });
            
            // Remover reserva buscando por nombre del objeto (cubre la rama if en línea 149)
            expect(() => excursion.removeListaEspera('2024-04-01', 'Cliente Objeto')).not.toThrow();
        });

        test('debe manejar requiereGuia() con diferentes valores booleanos', () => {
            // Test con guía requerida (true)
            const excursionConGuia = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, true, 2);
            expect(excursionConGuia.requiereGuia()).toBe(true);
            
            // Test con guía no requerida (false)
            const excursionSinGuia = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            expect(excursionSinGuia.requiereGuia()).toBe(false);
            
            // Test con valor truthy (cubre conversión Boolean)
            const paqueteConGuia = new PaqueteDeAventura(['2024-04-01'], 1000, 10, 4, 1, []);
            expect(paqueteConGuia.requiereGuia()).toBe(true);
        });

        test('debe manejar console.log con infoReserva.nombre undefined', () => {
            const excursion = new ExcursionGuiada(['2024-04-01'], 1000, 10, 4, false, 2);
            
            // Agregar reserva con objeto sin nombre para cubrir la rama || reservaInfo
            excursion.addListaEspera('2024-04-01', { cantidadPersonas: 1 });
            
            const listaEspera = excursion.getListaEspera('2024-04-01');
            expect(listaEspera).toHaveLength(1);
        });
    });
});