import { PagoEfectivo, PagoTransferencia } from '../../domain/entities/pagos.js';

/**
 * Clase para la gestión de facturación
 */
export class Facturacion {
    /**
     * Constructor
     * @param {Object} experiencia - Experiencia turística
     */
    constructor(experiencia) {
        this.experiencia = experiencia;
        this.pagos = new Map();
        this.facturas = new Map();
        this.plazoPago = 7; // días
        this.reservasCanceladas = [];
    }

    /**
     * Crea una factura para una reserva
     * @param {string} fecha - Fecha de la reserva
     * @param {string} nombre - Nombre del cliente
     * @returns {Object} - Factura creada
     */
    crearFactura(fecha, nombre) {
        if (!this.facturas.has(fecha)) {
            this.facturas.set(fecha, new Map());
        }
        
        const factura = {
            nombre,
            montoTotal: this.experiencia.getPrecioTotal(),
            saldoPendiente: this.experiencia.getPrecioTotal(),
            fechaCreacion: new Date(),
            fechaVencimiento: new Date(new Date().getTime() + this.plazoPago * 24 * 60 * 60 * 1000)
        };
        
        this.facturas.get(fecha).set(nombre, factura);
        return factura;
    }

    /**
     * Registra un pago para una factura
     * @param {string} fecha - Fecha de la reserva
     * @param {string} nombre - Nombre del cliente
     * @param {string} tipoPago - Tipo de pago (efectivo, transferencia)
     * @param {Object} datosPago - Datos específicos del pago
     * @returns {Object} - Resultado del pago
     */
    registrarPago(fecha, nombre, tipoPago, datosPago) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }
        
        const factura = this.facturas.get(fecha).get(nombre);
        let medioPago;
        
        switch (tipoPago) {
            case 'efectivo':
                medioPago = new PagoEfectivo();
                break;
            case 'transferencia':
                medioPago = new PagoTransferencia();
                break;
            default:
                throw new Error("Medio de pago no soportado");
        }
        
        const datos = {
            ...datosPago,
            montoFactura: factura.saldoPendiente,
            fechaFactura: factura.fechaCreacion,
            fechaPago: datosPago.fechaPago || new Date(),
            plazoDias: this.plazoPago,
            nombreCliente: nombre
        };
        
        const resultado = medioPago.pagar(datos);
        
        // Actualizar el saldo pendiente
        factura.saldoPendiente = 0;
        
        // Registrar el pago
        if (!this.pagos.has(fecha)) {
            this.pagos.set(fecha, new Map());
        }
        this.pagos.get(fecha).set(nombre, {
            tipo: tipoPago,
            datos: datosPago,
            resultado,
            fechaPago: datos.fechaPago
        });
        
        return { factura, resultado };
    }

    /**
     * Obtiene el saldo pendiente de una factura
     * @param {string} fecha - Fecha de la reserva
     * @param {string} nombre - Nombre del cliente
     * @returns {number} - Saldo pendiente
     */
    obtenerSaldoPendiente(fecha, nombre) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }
        
        return this.facturas.get(fecha).get(nombre).saldoPendiente;
    }

    /**
     * Verifica si una factura está vencida
     * @param {string} fecha - Fecha de la reserva
     * @param {string} nombre - Nombre del cliente
     * @returns {boolean} - true si está vencida, false en caso contrario
     */
    verificarVencimiento(fecha, nombre) {
        if (!this.facturas.has(fecha) || !this.facturas.get(fecha).has(nombre)) {
            throw new Error("No existe factura para esta reserva");
        }
        
        const factura = this.facturas.get(fecha).get(nombre);
        const ahora = new Date();
        
        return ahora > factura.fechaVencimiento;
    }

    /**
     * Obtiene las facturas con saldo pendiente
     * @returns {Array} - Lista de facturas pendientes
     */
    obtenerFacturasPendientes() {
        const facturasPendientes = [];
        
        this.facturas.forEach((clientesMap, fecha) => {
            clientesMap.forEach((factura, nombre) => {
                if (factura.saldoPendiente > 0) {
                    facturasPendientes.push({
                        fecha,
                        nombre,
                        ...factura
                    });
                }
            });
        });
        
        return facturasPendientes;
    }

    /**
     * Verifica y cancela las reservas vencidas que no han sido pagadas
     * @returns {Array} - Lista de reservas canceladas
     */
    verificarYCancelarReservasVencidas() {
        const facturasPendientes = this.obtenerFacturasPendientes();
        const reservasCanceladas = [];
        
        facturasPendientes.forEach(factura => {
            const { fecha, nombre } = factura;
            
            if (this.verificarVencimiento(fecha, nombre)) {
                try {
                    // Obtener la reserva para saber cuántos cupos se liberarán
                    const reservaFecha = this.experiencia.listaReservas.find(
                        r => r.fecha.getTime() === new Date(fecha).getTime()
                    );
                    
                    if (!reservaFecha) return;
                    
                    const reserva = reservaFecha.reservas.find(r => 
                        typeof r === 'object' ? r.nombre === nombre : r === nombre
                    );
                    
                    const cuposLiberados = reserva && reserva.cantidadPersonas ? reserva.cantidadPersonas : 1;
                    
                    // Obtener la lista de espera antes de cancelar
                    const listaEspera = this.experiencia.getListaEspera(fecha);
                    
                    // Cancelar la reserva
                    this.experiencia.removeListaReservas(fecha, nombre);
                    
                    // Procesar la lista de espera con la estrategia configurada
                    const estrategia = this.experiencia.getEstrategiaListaDeEspera();
                    if (estrategia && listaEspera.length > 0) {
                        estrategia.procesarListaDeEspera(cuposLiberados, listaEspera, this.experiencia, fecha);
                    }
                    
                    // Registrar la cancelación
                    const cancelacion = {
                        fecha,
                        nombre,
                        fechaCancelacion: new Date(),
                        motivo: 'Falta de pago en el plazo establecido'
                    };
                    
                    this.reservasCanceladas.push(cancelacion);
                    reservasCanceladas.push(cancelacion);
                } catch (error) {
                    console.error(`Error al cancelar reserva: ${error.message}`);
                }
            }
        });
        
        return reservasCanceladas;
    }

    /**
     * Obtiene el historial de cancelaciones automáticas
     * @returns {Array} - Historial de cancelaciones
     */
    obtenerHistorialCancelacionesAutomaticas() {
        return this.reservasCanceladas;
    }
}
