export class Facturacion {
    constructor(experiencia) {
        this.experiencia = experiencia;
        this.pagos = new Map(); // Map<fecha, {nombre: string, monto: number, fechaPago: Date}>
        this.facturas = new Map(); // Map<fecha, {nombre: string, montoTotal: number, saldoPendiente: number}>
        this.plazoPago = 7; // días para realizar el pago
    }

    crearFactura(fecha, nombre) {
        const montoTotal = this.experiencia.GetPrecioTotal();
        const factura = {
            nombre: nombre,
            montoTotal: montoTotal,
            saldoPendiente: montoTotal,
            fechaCreacion: new Date(),
            fechaVencimiento: new Date(new Date().getTime() + this.plazoPago * 24 * 60 * 60 * 1000)
        };

        if (!this.facturas.has(fecha)) {
            this.facturas.set(fecha, new Map());
        }
        this.facturas.get(fecha).set(nombre, factura);
        return factura;
    }

    registrarPago(fecha, nombre, monto) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }

        const factura = this.facturas.get(fecha).get(nombre);
        
        if (monto > factura.saldoPendiente) {
            throw new Error("El monto excede el saldo pendiente");
        }

        const pago = {
            nombre: nombre,
            monto: monto,
            fechaPago: new Date()
        };

        if (!this.pagos.has(fecha)) {
            this.pagos.set(fecha, new Map());
        }
        this.pagos.get(fecha).set(nombre, pago);

        factura.saldoPendiente -= monto;

        if (factura.saldoPendiente === 0) {
            console.log(`Factura pagada completamente para ${nombre} en la fecha ${fecha}`);
        }

        return factura;
    }

    obtenerSaldoPendiente(fecha, nombre) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }
        return this.facturas.get(fecha).get(nombre).saldoPendiente;
    }

    verificarVencimiento(fecha, nombre) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }

        const factura = this.facturas.get(fecha).get(nombre);
        const hoy = new Date();

        if (hoy > factura.fechaVencimiento && factura.saldoPendiente > 0) {
            // Cancelar la reserva automáticamente
            this.experiencia.RemoveListaReservas(fecha, nombre);
            console.log(`Reserva cancelada automáticamente para ${nombre} por falta de pago`);
            return true;
        }
        return false;
    }

    obtenerFacturasPendientes() {
        const facturasPendientes = [];
        for (const [fecha, facturasFecha] of this.facturas) {
            for (const [nombre, factura] of facturasFecha) {
                if (factura.saldoPendiente > 0) {
                    facturasPendientes.push({
                        fecha: fecha,
                        nombre: nombre,
                        montoTotal: factura.montoTotal,
                        saldoPendiente: factura.saldoPendiente,
                        fechaVencimiento: factura.fechaVencimiento
                    });
                }
            }
        }
        return facturasPendientes;
    }
} 