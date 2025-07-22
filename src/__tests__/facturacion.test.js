import { Facturacion } from '../facturacion/facturacion.js';
import { PaqueteDeAventura } from '../experiencias/paquete_de_aventura.js';
import {
    ValidadorPlazo,
    ValidadorCUIT,
    ValidadorTitularTransferencia,
    ValidadorDescuento,
    MedioDePago
} from '../facturacion/pagos.js';

describe('Facturacion', () => {
    let facturacion;
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
        facturacion = new Facturacion(experiencia);
    });

    describe('constructor', () => {
        test('debe inicializar correctamente los atributos', () => {
            expect(facturacion.experiencia).toBe(experiencia);
            expect(facturacion.pagos).toBeInstanceOf(Map);
            expect(facturacion.facturas).toBeInstanceOf(Map);
            expect(facturacion.plazoPago).toBe(7);
            expect(facturacion.reservasCanceladas).toBeInstanceOf(Array);
        });
    });

    describe('crearFactura', () => {
        test('debe crear una factura correctamente', () => {
            const factura = facturacion.crearFactura(fecha, nombre);
            
            expect(factura.nombre).toBe(nombre);
            expect(factura.montoTotal).toBe(2000);
            expect(factura.saldoPendiente).toBe(2000);
            expect(factura.fechaCreacion).toBeInstanceOf(Date);
            expect(factura.fechaVencimiento).toBeInstanceOf(Date);
        });

        test('debe almacenar la factura en el mapa de facturas', () => {
            facturacion.crearFactura(fecha, nombre);
            expect(facturacion.facturas.has(fecha)).toBe(true);
            expect(facturacion.facturas.get(fecha).has(nombre)).toBe(true);
        });
    });

    describe('registrarPago', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe registrar un pago en efectivo correctamente', () => {
            const datosPago = { montoPagado: 2000 };
            const { factura, resultado } = facturacion.registrarPago(fecha, nombre, 'efectivo', datosPago);
            expect(factura.saldoPendiente).toBe(0);
            expect(resultado.vuelto).toBe(0);
        });

        test('debe lanzar error si el monto pagado en efectivo es insuficiente', () => {
            const datosPago = { montoPagado: 1000 };
            expect(() => {
                facturacion.registrarPago(fecha, nombre, 'efectivo', datosPago);
            }).toThrow('El monto pagado es insuficiente.');
        });

        test('debe registrar un pago por transferencia correctamente', () => {
            const datosPago = {
                cuit: '20329642330',
                banco: 'Banco Nación',
                titular: nombre,
                fechaPago: new Date(),
            };
            const { factura, resultado } = facturacion.registrarPago(fecha, nombre, 'transferencia', datosPago);
            expect(factura.saldoPendiente).toBe(0);
            expect(resultado.exito).toBe(true);
        });

        test('debe lanzar error si el CUIT es inválido en transferencia', () => {
            const datosPago = {
                cuit: '12345678901',
                banco: 'Banco Nación',
                titular: nombre,
                fechaPago: new Date(),
            };
            expect(() => {
                facturacion.registrarPago(fecha, nombre, 'transferencia', datosPago);
            }).toThrow('CUIT inválido');
        });

        test('debe lanzar error si el titular no coincide en transferencia', () => {
            const datosPago = {
                cuit: '20329642330',
                banco: 'Banco Nación',
                titular: 'Otro Nombre',
                fechaPago: new Date(),
            };
            expect(() => {
                facturacion.registrarPago(fecha, nombre, 'transferencia', datosPago);
            }).toThrow('El titular de la cuenta no coincide');
        });
    });

    describe('obtenerSaldoPendiente', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe devolver el saldo pendiente correcto', () => {
            expect(facturacion.obtenerSaldoPendiente(fecha, nombre)).toBe(2000);
        });

        test('debe lanzar error si no existe factura', () => {
            expect(() => {
                facturacion.obtenerSaldoPendiente("2024-04-02", nombre);
            }).toThrow("No existe factura para esta reserva");
        });
    });

    describe('verificarVencimiento', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe devolver false si la factura no está vencida', () => {
            expect(facturacion.verificarVencimiento(fecha, nombre)).toBe(false);
        });

        test('debe lanzar error si no existe factura', () => {
            expect(() => {
                facturacion.verificarVencimiento("2024-04-02", nombre);
            }).toThrow("No existe factura para esta reserva");
        });
    });

    describe('obtenerFacturasPendientes', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
            facturacion.crearFactura(fecha, "María García");
            facturacion.registrarPago(fecha, "María García", 'efectivo', { montoPagado: 2000 });
        });

        test('debe devolver solo las facturas con saldo pendiente', () => {
            const facturasPendientes = facturacion.obtenerFacturasPendientes();
            expect(facturasPendientes).toHaveLength(1);
            expect(facturasPendientes[0].nombre).toBe(nombre);
            expect(facturasPendientes[0].saldoPendiente).toBe(2000);
        });
    });
    
    describe('verificarYCancelarReservasVencidas', () => {
        beforeEach(() => {
            // Agregar el nombre a la lista de reservas
            experiencia.addListaReservas(fecha, nombre);
            
            // Crear una factura con fecha de vencimiento en el pasado
            const factura = facturacion.crearFactura(fecha, nombre);
            
            // Modificar la fecha de vencimiento para que esté en el pasado
            const fechaPasada = new Date();
            fechaPasada.setDate(fechaPasada.getDate() - 1); // Un día en el pasado
            facturacion.facturas.get(fecha).get(nombre).fechaVencimiento = fechaPasada;
            
            // Agregar alguien a la lista de espera
            experiencia.addListaEspera(fecha, {
                nombre: "Carlos Rodríguez",
                email: "carlos@example.com",
                cantidadPersonas: 1
            });
        });
        
        test('debe cancelar reservas vencidas no pagadas', () => {
            // Verificar que la reserva existe antes de la cancelación
            const reservasAntes = experiencia.listaReservas.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            ).reservas;
            
            const tieneReservaAntes = reservasAntes.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(tieneReservaAntes).toBe(true);
            
            // Ejecutar la cancelación automática
            const reservasCanceladas = facturacion.verificarYCancelarReservasVencidas();
            
            // Verificar que la reserva fue cancelada
            const reservasDespues = experiencia.listaReservas.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            ).reservas;
            
            const tieneReservaDespues = reservasDespues.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(tieneReservaDespues).toBe(false);
            
            // Verificar que se registró la cancelación
            expect(reservasCanceladas).toHaveLength(1);
            expect(reservasCanceladas[0].nombre).toBe(nombre);
            expect(reservasCanceladas[0].motivo).toBe('Falta de pago en el plazo establecido');
        });
        
        test('debe promover reservas de la lista de espera al cancelar', () => {
            // Ejecutar la cancelación automática
            facturacion.verificarYCancelarReservasVencidas();
            
            // Verificar que la persona en espera fue confirmada
            const reservasConfirmadas = experiencia.listaReservas.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            ).reservas;
            
            const tieneReservaCarlos = reservasConfirmadas.some(r => {
                return typeof r === 'object' && r.nombre === "Carlos Rodríguez";
            });
            expect(tieneReservaCarlos).toBe(true);
            
            // Verificar que ya no está en la lista de espera
            const listaEspera = experiencia.getListaEspera(fecha);
            const carlosEnEspera = listaEspera.some(r => {
                return typeof r === 'object' && r.nombre === "Carlos Rodríguez";
            });
            expect(carlosEnEspera).toBe(false);
        });
        
        test('no debe cancelar reservas pagadas', () => {
            // Registrar un pago completo usando el nuevo flujo (efectivo)
            facturacion.registrarPago(fecha, nombre, 'efectivo', { montoPagado: 2000 });
            // Ejecutar la cancelación automática
            const reservasCanceladas = facturacion.verificarYCancelarReservasVencidas();
            // Verificar que no se canceló ninguna reserva
            expect(reservasCanceladas).toHaveLength(0);
            // Verificar que la reserva sigue existiendo
            const reservas = experiencia.listaReservas.find(
                r => r.fecha.getTime() === new Date(fecha).getTime()
            ).reservas;
            const tieneReserva = reservas.some(r => {
                return typeof r === 'object' ? r.nombre === nombre : r === nombre;
            });
            expect(tieneReserva).toBe(true);
        });
        
        test('debe mantener un historial de cancelaciones', () => {
            // Ejecutar la cancelación automática
            facturacion.verificarYCancelarReservasVencidas();
            
            // Verificar el historial de cancelaciones
            const historial = facturacion.obtenerHistorialCancelacionesAutomaticas();
            expect(historial).toHaveLength(1);
            expect(historial[0].nombre).toBe(nombre);
            expect(historial[0].fecha).toBe(fecha);
            expect(historial[0].fechaCancelacion).toBeInstanceOf(Date);
            expect(historial[0].motivo).toBe('Falta de pago en el plazo establecido');
        });
    });
});

describe('Cobertura adicional de validadores y pagos', () => {
    test('ValidadorPlazo permite pago justo en el límite', () => {
        const val = new ValidadorPlazo();
        const hoy = new Date();
        const datos = {
            fechaFactura: hoy,
            fechaPago: new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000),
            plazoDias: 7
        };
        expect(() => val.validar(datos)).not.toThrow();
    });

    test('ValidadorCUIT falla por longitud incorrecta', () => {
        const val = new ValidadorCUIT();
        expect(() => val.validar({ cuit: '2032964233' })).toThrow('debe tener 11 dígitos');
    });

    test('ValidadorCUIT falla por dígito verificador incorrecto', () => {
        const val = new ValidadorCUIT();
        // CUIT con dígito verificador incorrecto
        expect(() => val.validar({ cuit: '20329642331' })).toThrow('CUIT inválido: dígito verificador incorrecto.');
    });

    test('ValidadorCUIT falla por tipo de persona jurídica', () => {
        const val = new ValidadorCUIT();
        // CUIT de persona jurídica (30) con dígito verificador correcto: 30-70831801-5
        expect(() => val.validar({ cuit: '30708318015' })).toThrow('Sólo se permite CUIT de persona física.');
    });

    test('ValidadorDescuento no lanza error si no hay descuento', () => {
        const val = new ValidadorDescuento();
        expect(() => val.validar({})).not.toThrow();
    });

    test('MedioDePago lanza error si se llama a pagar directamente', () => {
        const medio = new MedioDePago();
        expect(() => medio.pagar({})).toThrow('Método pagar() no implementado.');
    });

    test('Facturacion: error si tipo de pago no soportado', () => {
        const fecha = '2024-04-01';
        const nombre = 'Juan Pérez';
        const actividades = [
            { nombre: 'Rafting', disponibilidad: [fecha] },
            { nombre: 'Trekking', disponibilidad: [fecha] }
        ];
        const experiencia = new PaqueteDeAventura(
            [fecha],
            2000,
            15,
            8,
            true,
            actividades
        );
        const facturacion = new Facturacion(experiencia);
        facturacion.crearFactura(fecha, nombre);
        expect(() => facturacion.registrarPago(fecha, nombre, 'tarjeta', {})).toThrow('Medio de pago no soportado');
    });
}); 