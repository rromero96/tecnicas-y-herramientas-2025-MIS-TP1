import { PagoEfectivo, PagoTransferencia } from './pagos.js';

export class Facturacion {
    constructor(experiencia) {
        this.experiencia = experiencia;
        this.pagos = new Map(); // Map<fecha, {nombre: string, monto: number, fechaPago: Date}>
        this.facturas = new Map(); // Map<fecha, {nombre: string, montoTotal: number, saldoPendiente: number}>
        this.plazoPago = 7; // días para realizar el pago
        this.reservasCanceladas = []; // Para llevar un registro de las reservas canceladas automáticamente
    }

    crearFactura(fecha, nombre) {
        const montoTotal = this.experiencia.getPrecioTotal();
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

    /**
     * Registrar un pago usando una estrategia de medio de pago (Strategy)
     * Aplica una cadena de validaciones (Chain of Responsibility) según el medio.
     * @param {string} fecha - Fecha de la reserva
     * @param {string} nombre - Nombre del cliente
     * @param {string} tipoPago - 'efectivo' | 'transferencia'
     * @param {object} datosPago - Datos requeridos por el medio de pago
     */
    registrarPago(fecha, nombre, tipoPago, datosPago) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }
        const factura = this.facturas.get(fecha).get(nombre);
        let medio;
        // Selección de estrategia de pago
        if (tipoPago === 'efectivo') {
            medio = new PagoEfectivo();
        } else if (tipoPago === 'transferencia') {
            medio = new PagoTransferencia();
        } else {
            throw new Error('Medio de pago no soportado');
        }
        // Preparar datos para la cadena de validadores
        const datos = {
            ...datosPago,
            fechaFactura: factura.fechaCreacion,
            fechaPago: datosPago.fechaPago || new Date(),
            plazoDias: this.plazoPago,
            montoFactura: factura.saldoPendiente,
            nombreCliente: nombre
        };
        // Ejecutar pago (puede lanzar error si falla una validación)
        const resultado = medio.pagar(datos);
        const pago = {
            nombre: nombre,
            monto: factura.saldoPendiente,
            fechaPago: datos.fechaPago,
            tipoPago,
            detalles: datosPago
        };
        if (!this.pagos.has(fecha)) {
            this.pagos.set(fecha, new Map());
        }
        this.pagos.get(fecha).set(nombre, pago);
        factura.saldoPendiente = 0;
        if (factura.saldoPendiente === 0) {
            console.log(`Factura pagada completamente para ${nombre} en la fecha ${fecha}`);
        }
        return { factura, resultado };
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
            this.experiencia.removeListaReservas(fecha, nombre);
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
    
    verificarYCancelarReservasVencidas() {
        const hoy = new Date();
        const reservasCanceladasEnEstaEjecucion = [];
        
        // Recorrer todas las facturas pendientes
        for (const [fecha, facturasFecha] of this.facturas) {
            this._procesarFacturasPendientesPorFecha(fecha, facturasFecha, hoy, reservasCanceladasEnEstaEjecucion);
        }
        
        return reservasCanceladasEnEstaEjecucion;
    }
    
    _procesarFacturasPendientesPorFecha(fecha, facturasFecha, fechaActual, reservasCanceladas) {
        for (const [nombre, factura] of facturasFecha) {
            // Verificar si la factura está vencida y no pagada completamente
            if (fechaActual > factura.fechaVencimiento && factura.saldoPendiente > 0) {
                this._cancelarReservaVencida(fecha, nombre, reservasCanceladas);
            }
        }
    }
    
    _cancelarReservaVencida(fecha, nombre, reservasCanceladas) {
        try {
            // Intentar cancelar la reserva
            this.experiencia.removeListaReservas(fecha, nombre);
            
            // Procesar la lista de espera
            this._procesarListaDeEspera(fecha);
            
            // Registrar la cancelación
            this._registrarCancelacion(fecha, nombre, reservasCanceladas);
            
            console.log(`Reserva cancelada automáticamente para ${nombre} en la fecha ${fecha} por falta de pago.`);
        } catch (error) {
            console.error(`Error al cancelar la reserva vencida: ${error.message}`);
        }
    }
    

    _procesarListaDeEspera(fecha) {
        const listaDeEspera = this.experiencia.getListaEspera(fecha);
        if (!listaDeEspera || listaDeEspera.length === 0) {
            return;
        }
        
       
        const cuposLiberados = 1;
        this._asignarReservasEnEspera(fecha, listaDeEspera, cuposLiberados);
    }

    _asignarReservasEnEspera(fecha, listaDeEspera, cuposLiberados) {
        let i = 0;
        let cuposDisponibles = cuposLiberados;
        
        while (i < listaDeEspera.length && cuposDisponibles > 0) {
            const reservaEnEspera = listaDeEspera[i];
            const personasNecesarias = reservaEnEspera.cantidadPersonas || 1;
            
            if (personasNecesarias <= cuposDisponibles) {
                this._confirmarReservaEnEspera(fecha, reservaEnEspera);
                cuposDisponibles -= personasNecesarias;
            } else {
                i++;
            }
        }
    }
    
    _confirmarReservaEnEspera(fecha, reservaEnEspera) {
        const nombreReserva = reservaEnEspera.nombre || reservaEnEspera;
        this.experiencia.removeListaEspera(fecha, nombreReserva);
        
        // Confirmar la reserva
        this.experiencia.addListaReservas(fecha, reservaEnEspera);
        console.log(`Reserva confirmada para ${nombreReserva} en la fecha ${fecha} desde la lista de espera.`);
    }
    

    _registrarCancelacion(fecha, nombre, reservasCanceladas) {
        const motivoCancelacion = 'Falta de pago en el plazo establecido';
        
        reservasCanceladas.push({
            fecha,
            nombre,
            motivo: motivoCancelacion
        });
        
        this.reservasCanceladas.push({
            fecha,
            nombre,
            fechaCancelacion: new Date(),
            motivo: motivoCancelacion
        });
    }
    

    obtenerHistorialCancelacionesAutomaticas() {
        return this.reservasCanceladas;
    }
} 