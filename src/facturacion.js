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
    
    /**
     * Método que se ejecutaría diariamente para cancelar reservas no pagadas
     * Este método simula un job o cron que se ejecutaría automáticamente
     * @returns {Array} - Lista de reservas canceladas
     */
    verificarYCancelarReservasVencidas() {
        const hoy = new Date();
        const reservasCanceladasEnEstaEjecucion = [];
        
        // Recorrer todas las facturas pendientes
        for (const [fecha, facturasFecha] of this.facturas) {
            for (const [nombre, factura] of facturasFecha) {
                // Verificar si la factura está vencida y no pagada completamente
                if (hoy > factura.fechaVencimiento && factura.saldoPendiente > 0) {
                    try {
                        // Intentar cancelar la reserva
                        this.experiencia.removeListaReservas(fecha, nombre);
                        
                        // Procesar la lista de espera
                        const listaDeEspera = this.experiencia.getListaEspera(fecha);
                        if (listaDeEspera && listaDeEspera.length > 0) {
                            // Obtener cuántos cupos se liberaron (si tenemos esa información)
                            let cuposLiberados = 1; // Por defecto asumimos 1 persona
                            
                            // Intentar asignar reservas de la lista de espera en orden de llegada
                            let i = 0;
                            let cuposDisponibles = cuposLiberados;
                            
                            while (i < listaDeEspera.length && cuposDisponibles > 0) {
                                const reservaEnEspera = listaDeEspera[i];
                                const personasNecesarias = reservaEnEspera.cantidadPersonas || 1;
                                
                                // Si hay suficientes cupos para esta reserva
                                if (personasNecesarias <= cuposDisponibles) {
                                    const nombreReserva = reservaEnEspera.nombre || reservaEnEspera;
                                    this.experiencia.removeListaEspera(fecha, nombreReserva);
                                    
                                    // Confirmar la reserva
                                    this.experiencia.addListaReservas(fecha, reservaEnEspera);
                                    console.log(`Reserva confirmada para ${nombreReserva} en la fecha ${fecha} desde la lista de espera.`);
                                    
                                    // Actualizar cupos disponibles
                                    cuposDisponibles -= personasNecesarias;
                                } else {
                                    // Si no hay suficientes cupos, pasar a la siguiente reserva
                                    i++;
                                }
                            }
                        }
                        
                        // Registrar la cancelación
                        reservasCanceladasEnEstaEjecucion.push({
                            fecha: fecha,
                            nombre: nombre,
                            motivo: 'Falta de pago en el plazo establecido'
                        });
                        
                        this.reservasCanceladas.push({
                            fecha: fecha,
                            nombre: nombre,
                            fechaCancelacion: new Date(),
                            motivo: 'Falta de pago en el plazo establecido'
                        });
                        
                        console.log(`Reserva cancelada automáticamente para ${nombre} en la fecha ${fecha} por falta de pago.`);
                    } catch (error) {
                        console.error(`Error al cancelar la reserva vencida: ${error.message}`);
                    }
                }
            }
        }
        
        return reservasCanceladasEnEstaEjecucion;
    }
    
    /**
     * Obtiene el historial de reservas canceladas automáticamente
     * @returns {Array} - Lista de reservas canceladas
     */
    obtenerHistorialCancelacionesAutomaticas() {
        return this.reservasCanceladas;
    }
} 