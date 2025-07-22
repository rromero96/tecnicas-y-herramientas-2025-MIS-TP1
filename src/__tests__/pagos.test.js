import {
    ValidadorPlazo,
    ValidadorCUIT,
    ValidadorTitularTransferencia,
    ValidadorDescuento,
    PagoEfectivo,
    PagoTransferencia,
    MedioDePago
} from '../facturacion/pagos.js';

describe('Validadores de Pago', () => {
    test('ValidadorPlazo: pago dentro del plazo', () => {
        const val = new ValidadorPlazo();
        const hoy = new Date();
        const datos = {
            fechaFactura: hoy,
            fechaPago: new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000),
            plazoDias: 7
        };
        expect(() => val.validar(datos)).not.toThrow();
    });
    test('ValidadorPlazo: pago fuera del plazo', () => {
        const val = new ValidadorPlazo();
        const hoy = new Date();
        const datos = {
            fechaFactura: hoy,
            fechaPago: new Date(hoy.getTime() + 10 * 24 * 60 * 60 * 1000),
            plazoDias: 7
        };
        expect(() => val.validar(datos)).toThrow('El pago está fuera del plazo permitido.');
    });
    test('ValidadorCUIT: CUIT válido persona física', () => {
        const val = new ValidadorCUIT();
        expect(() => val.validar({ cuit: '20329642330' })).not.toThrow();
    });
    test('ValidadorCUIT: CUIT inválido formato', () => {
        const val = new ValidadorCUIT();
        expect(() => val.validar({ cuit: '123' })).toThrow('CUIT inválido: debe tener 11 dígitos.');
    });
    test('ValidadorTitularTransferencia: titular coincide', () => {
        const val = new ValidadorTitularTransferencia();
        expect(() => val.validar({ titular: 'Juan', nombreCliente: 'Juan' })).not.toThrow();
    });
    test('ValidadorTitularTransferencia: titular no coincide', () => {
        const val = new ValidadorTitularTransferencia();
        expect(() => val.validar({ titular: 'Juan', nombreCliente: 'Pedro' })).toThrow('El titular de la cuenta no coincide con el cliente.');
    });
    test('ValidadorDescuento: no lanza error', () => {
        const val = new ValidadorDescuento();
        expect(() => val.validar({})).not.toThrow();
    });
});

describe('PagoEfectivo', () => {
    test('pago correcto devuelve vuelto', () => {
        const pago = new PagoEfectivo();
        const datos = { montoPagado: 2500, montoFactura: 2000 };
        const res = pago.pagar(datos);
        expect(res.exito).toBe(true);
        expect(res.vuelto).toBe(500);
    });
    test('pago insuficiente lanza error', () => {
        const pago = new PagoEfectivo();
        const datos = { montoPagado: 1000, montoFactura: 2000 };
        expect(() => pago.pagar(datos)).toThrow('El monto pagado es insuficiente.');
    });
});

describe('PagoTransferencia', () => {
    test('pago correcto', () => {
        const pago = new PagoTransferencia();
        const datos = {
            fechaFactura: new Date(),
            fechaPago: new Date(),
            plazoDias: 7,
            cuit: '20329642330',
            banco: 'Banco Nación',
            titular: 'Juan Pérez',
            nombreCliente: 'Juan Pérez'
        };
        const res = pago.pagar(datos);
        expect(res.exito).toBe(true);
    });
    test('pago con CUIT inválido lanza error', () => {
        const pago = new PagoTransferencia();
        const datos = {
            fechaFactura: new Date(),
            fechaPago: new Date(),
            plazoDias: 7,
            cuit: '12345678901',
            banco: 'Banco Nación',
            titular: 'Juan Pérez',
            nombreCliente: 'Juan Pérez'
        };
        expect(() => pago.pagar(datos)).toThrow();
    });
    test('pago con titular incorrecto lanza error', () => {
        const pago = new PagoTransferencia();
        const datos = {
            fechaFactura: new Date(),
            fechaPago: new Date(),
            plazoDias: 7,
            cuit: '20329642330',
            banco: 'Banco Nación',
            titular: 'Otro',
            nombreCliente: 'Juan Pérez'
        };
        expect(() => pago.pagar(datos)).toThrow('El titular de la cuenta no coincide con el cliente.');
    });
});

describe('MedioDePago', () => {
    test('lanza error si se llama a pagar directamente', () => {
        const medio = new MedioDePago();
        expect(() => medio.pagar({})).toThrow('Método pagar() no implementado.');
    });
}); 