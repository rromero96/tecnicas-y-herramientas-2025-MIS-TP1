// Patrón Strategy para medios de pago y Chain of Responsibility para validaciones

// Interfaz base para validadores de pago
export class ValidadorPago {
    // Permite encadenar el siguiente validador
    setSiguiente(validador) {
        this.siguiente = validador;
        return validador;
    }
    // Ejecuta la validación y pasa al siguiente si existe
    validar(datos) {
        if (this.siguiente) {
            return this.siguiente.validar(datos);
        }
        return true;
    }
}

// Valida que el pago esté dentro del plazo permitido
export class ValidadorPlazo extends ValidadorPago {
    validar(datos) {
        const { fechaFactura, fechaPago, plazoDias } = datos;
        const vencimiento = new Date(fechaFactura);
        vencimiento.setDate(vencimiento.getDate() + plazoDias);
        if (new Date(fechaPago) > vencimiento) {
            throw new Error('El pago está fuera del plazo permitido.');
        }
        return super.validar(datos);
    }
}

// Valida el CUIT argentino (persona física, 11 dígitos, dígito verificador)
export class ValidadorCUIT extends ValidadorPago {
    validar(datos) {
        const { cuit } = datos;
        // Verifica formato y longitud
        if (!/^20|23|24|27|30|33|34[0-9]{9}$/.test(cuit)) {
            throw new Error('CUIT inválido: formato incorrecto.');
        }
        if (cuit.length !== 11) {
            throw new Error('CUIT inválido: debe tener 11 dígitos.');
        }
        // Verifica dígito verificador
        const mult = [5,4,3,2,7,6,5,4,3,2];
        let suma = 0;
        for (let i = 0; i < 10; i++) suma += parseInt(cuit[i]) * mult[i];
        let mod = suma % 11;
        let digito = 11 - mod;
        if (digito === 11) digito = 0;
        if (digito === 10) digito = 9;
        if (parseInt(cuit[10]) !== digito) {
            throw new Error('CUIT inválido: dígito verificador incorrecto.');
        }
        // Solo persona física
        if (!['20','23','24','27'].includes(cuit.substring(0,2))) {
            throw new Error('Sólo se permite CUIT de persona física.');
        }
        return super.validar(datos);
    }
}

// Valida que el titular de la cuenta coincida con el cliente
export class ValidadorTitularTransferencia extends ValidadorPago {
    validar(datos) {
        const { titular, nombreCliente } = datos;
        if (titular !== nombreCliente) {
            throw new Error('El titular de la cuenta no coincide con el cliente.');
        }
        return super.validar(datos);
    }
}

// Validador de descuentos (puede extenderse para lógica real)
export class ValidadorDescuento extends ValidadorPago {
    validar(datos) {
        // Aquí se podría aplicar lógica de descuento
        return super.validar(datos);
    }
}

// Interfaz base para medios de pago (Strategy)
export class MedioDePago {
    constructor() {
        this.cadenaValidadores = null;
    }
    // Permite configurar la cadena de validadores
    setCadenaValidadores(validador) {
        this.cadenaValidadores = validador;
    }
    // Ejecuta la cadena de validadores (debe ser sobreescrito por subclases)
    pagar(datos) {
        if (this.cadenaValidadores) {
            this.cadenaValidadores.validar(datos);
        }
        throw new Error('Método pagar() no implementado.');
    }
}

// Estrategia de pago en efectivo
export class PagoEfectivo extends MedioDePago {
    constructor() {
        super();
        // Plazo y descuento, pero NO CUIT ni titular
        const plazo = new ValidadorPlazo();
        const descuento = new ValidadorDescuento();
        plazo.setSiguiente(descuento);
        this.setCadenaValidadores(plazo);
    }
    // Realiza el pago en efectivo, calcula el vuelto
    pagar(datos) {
        if (this.cadenaValidadores) {
            this.cadenaValidadores.validar(datos);
        }
        const { montoPagado, montoFactura } = datos;
        if (montoPagado < montoFactura) {
            throw new Error('El monto pagado es insuficiente.');
        }
        const vuelto = montoPagado - montoFactura;
        return { exito: true, vuelto };
    }
}

// Estrategia de pago por transferencia bancaria
export class PagoTransferencia extends MedioDePago {
    constructor() {
        super();
        // Plazo -> CUIT -> Descuento -> Titular
        const plazo = new ValidadorPlazo();
        const cuit = new ValidadorCUIT();
        const descuento = new ValidadorDescuento();
        const titular = new ValidadorTitularTransferencia();
        plazo.setSiguiente(cuit).setSiguiente(descuento).setSiguiente(titular);
        this.setCadenaValidadores(plazo);
    }
    // Realiza el pago por transferencia, valida CUIT y titular
    pagar(datos) {
        if (this.cadenaValidadores) {
            this.cadenaValidadores.validar(datos);
        }
        // Aquí se podría registrar banco, titular, etc.
        return { exito: true };
    }
} 