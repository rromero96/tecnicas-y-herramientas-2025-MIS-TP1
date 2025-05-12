import { Facturacion } from '../facturacion.js';
import { PaqueteDeAventura } from '../paquete_de_aventura.js';

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

        test('debe registrar un pago correctamente', () => {
            const factura = facturacion.registrarPago(fecha, nombre, 1000);
            expect(factura.saldoPendiente).toBe(1000);
            expect(facturacion.pagos.has(fecha)).toBe(true);
            expect(facturacion.pagos.get(fecha).has(nombre)).toBe(true);
        });

        test('debe lanzar error si no existe factura', () => {
            expect(() => {
                facturacion.registrarPago("2024-04-02", nombre, 1000);
            }).toThrow("No existe factura para esta reserva");
        });

        test('debe lanzar error si el monto excede el saldo', () => {
            expect(() => {
                facturacion.registrarPago(fecha, nombre, 3000);
            }).toThrow("El monto excede el saldo pendiente");
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
            facturacion.registrarPago(fecha, "María García", 2000);
        });

        test('debe devolver solo las facturas con saldo pendiente', () => {
            const facturasPendientes = facturacion.obtenerFacturasPendientes();
            expect(facturasPendientes).toHaveLength(1);
            expect(facturasPendientes[0].nombre).toBe(nombre);
            expect(facturasPendientes[0].saldoPendiente).toBe(2000);
        });
    });
}); 