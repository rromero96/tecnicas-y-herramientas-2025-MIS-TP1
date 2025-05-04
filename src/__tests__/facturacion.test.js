import { Facturacion } from '../facturacion.js';
import { ExcursionGuiada } from '../experiencias.js';

describe('Facturacion', () => {
    let excursion;
    let facturacion;
    const fecha = "2024-04-01";
    const nombre = "Juan Pérez";
    const precio = 1000;

    beforeEach(() => {
        excursion = new ExcursionGuiada(
            [fecha],
            precio,
            20,
            4,
            true,
            2
        );
        facturacion = new Facturacion(excursion);
    });

    describe('crearFactura', () => {
        test('debe crear una factura correctamente', () => {
            const factura = facturacion.crearFactura(fecha, nombre);
            
            expect(factura).toBeDefined();
            expect(factura.nombre).toBe(nombre);
            expect(factura.montoTotal).toBe(precio);
            expect(factura.saldoPendiente).toBe(precio);
            expect(factura.fechaCreacion).toBeInstanceOf(Date);
            expect(factura.fechaVencimiento).toBeInstanceOf(Date);
        });

    });

    describe('registrarPago', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe registrar un pago correctamente', () => {
            const monto = 500;
            const factura = facturacion.registrarPago(fecha, nombre, monto);
            
            expect(factura.saldoPendiente).toBe(precio - monto);
        });

        test('debe lanzar error si el monto excede el saldo pendiente', () => {
            expect(() => {
                facturacion.registrarPago(fecha, nombre, precio + 100);
            }).toThrow("El monto excede el saldo pendiente");
        });

        test('debe lanzar error si no existe la factura', () => {
            expect(() => {
                facturacion.registrarPago(fecha, "Nombre inexistente", 100);
            }).toThrow("No existe factura para esta reserva");
        });
    });

    describe('obtenerSaldoPendiente', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe devolver el saldo pendiente correctamente', () => {
            const saldo = facturacion.obtenerSaldoPendiente(fecha, nombre);
            expect(saldo).toBe(precio);
        });

        test('debe lanzar error si no existe la factura', () => {
            expect(() => {
                facturacion.obtenerSaldoPendiente(fecha, "Nombre inexistente");
            }).toThrow("No existe factura para esta reserva");
        });
    });

    describe('verificarVencimiento', () => {
        beforeEach(() => {
            facturacion.crearFactura(fecha, nombre);
        });

        test('debe devolver false si la factura no está vencida', () => {
            const vencida = facturacion.verificarVencimiento(fecha, nombre);
            expect(vencida).toBe(false);
        });

    });

    describe('obtenerFacturasPendientes', () => {
        test('debe devolver un array vacío si no hay facturas pendientes', () => {
            const pendientes = facturacion.obtenerFacturasPendientes();
            expect(pendientes).toHaveLength(0);
        });

        test('debe devolver las facturas pendientes correctamente', () => {
            facturacion.crearFactura(fecha, nombre);
            const pendientes = facturacion.obtenerFacturasPendientes();
            
            expect(pendientes).toHaveLength(1);
            expect(pendientes[0].nombre).toBe(nombre);
            expect(pendientes[0].saldoPendiente).toBe(precio);
        });

        test('no debe incluir facturas pagadas', () => {
            facturacion.crearFactura(fecha, nombre);
            facturacion.registrarPago(fecha, nombre, precio);
            
            const pendientes = facturacion.obtenerFacturasPendientes();
            expect(pendientes).toHaveLength(0);
        });
    });
}); 