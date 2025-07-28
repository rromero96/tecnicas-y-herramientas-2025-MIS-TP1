export class Validador {
    /**
     * Valida los datos según las reglas específicas
     * @param {Object} datos - Datos a validar
     * @throws {Error} Si la validación falla
     */
    validar(datos) {
        throw new Error('Método validar() debe ser implementado por las clases hijas');
    }

    /**
     * Establece el siguiente validador en la cadena
     * @param {Validador} siguiente - Siguiente validador
     * @returns {Validador} - El validador configurado
     */
    setSiguiente(siguiente) {
        this.siguiente = siguiente;
        return siguiente;
    }

    /**
     * Ejecuta la validación y pasa al siguiente validador si existe
     * @param {Object} datos - Datos a validar
     * @throws {Error} Si la validación falla
     */
    ejecutar(datos) {
        this.validar(datos);
        if (this.siguiente) {
            this.siguiente.ejecutar(datos);
        }
    }
}

/**
 * Validador de plazo de pago
 */
export class ValidadorPlazo extends Validador {
    /**
     * Valida que el pago se realice dentro del plazo establecido
     * @param {Object} datos - Datos del pago
     * @throws {Error} Si el pago está fuera de plazo
     */
    validar(datos) {
        const { fechaFactura, fechaPago, plazoDias } = datos;
        
        if (!fechaFactura || !fechaPago || !plazoDias) {
            throw new Error('Faltan datos para validar el plazo');
        }
        
        const fechaLimite = new Date(fechaFactura);
        fechaLimite.setDate(fechaLimite.getDate() + plazoDias);
        
        if (fechaPago > fechaLimite) {
            throw new Error('El pago está fuera del plazo permitido.');
        }
    }
}

/**
 * Validador de CUIT
 */
export class ValidadorCUIT extends Validador {
    /**
     * Valida que el CUIT sea válido
     * @param {Object} datos - Datos del pago
     * @throws {Error} Si el CUIT es inválido
     */
    validar(datos) {
        const { cuit } = datos;
        
        if (!cuit) {
            throw new Error('Falta el CUIT');
        }
        
        if (cuit.length !== 11) {
            throw new Error('CUIT inválido: debe tener 11 dígitos.');
        }
        
        // Verificar que sea persona física (20, 23, 24 o 27)
        const tipoPersona = cuit.substring(0, 2);
        if (!['20', '23', '24', '27'].includes(tipoPersona)) {
            // Si es un tipo de persona jurídica conocido, dar mensaje específico
            if (['30', '33', '34'].includes(tipoPersona)) {
                throw new Error('Sólo se permite CUIT de persona física.');
            }
            // Para otros tipos no válidos, dar mensaje genérico
            throw new Error('CUIT inválido');
        }
        
        // Algoritmo de validación del dígito verificador
        const coeficiente = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        
        for (let i = 0; i < 10; i++) {
            suma += parseInt(cuit.charAt(i)) * coeficiente[i];
        }
        
        const resto = suma % 11;
        const digitoVerificador = resto === 0 ? 0 : 11 - resto;
        
        if (digitoVerificador !== parseInt(cuit.charAt(10))) {
            throw new Error('CUIT inválido: dígito verificador incorrecto.');
        }
    }
}

/**
 * Validador de titular de transferencia
 */
export class ValidadorTitularTransferencia extends Validador {
    /**
     * Valida que el titular de la transferencia coincida con el cliente
     * @param {Object} datos - Datos del pago
     * @throws {Error} Si el titular no coincide
     */
    validar(datos) {
        const { titular, nombreCliente } = datos;
        
        if (!titular || !nombreCliente) {
            throw new Error('Faltan datos para validar el titular');
        }
        
        if (titular !== nombreCliente) {
            throw new Error('El titular de la cuenta no coincide con el cliente.');
        }
    }
}

/**
 * Validador de descuentos
 */
export class ValidadorDescuento extends Validador {
    /**
     * Valida que el descuento sea aplicable
     * @param {Object} datos - Datos del pago
     */
    validar(datos) {
        // Este validador no lanza errores, solo verifica si hay descuento
        // y podría aplicar lógica adicional en el futuro
    }
}

/**
 * Clase base para medios de pago
 */
export class MedioDePago {
    /**
     * Constructor
     */
    constructor() {
        this.primerValidador = null;
        this.ultimoValidador = null;
    }

    /**
     * Agrega un validador a la cadena
     * @param {Validador} validador - Validador a agregar
     * @returns {MedioDePago} - El medio de pago para encadenamiento
     */
    agregarValidador(validador) {
        if (!this.primerValidador) {
            this.primerValidador = validador;
            this.ultimoValidador = validador;
        } else {
            this.ultimoValidador = this.ultimoValidador.setSiguiente(validador);
        }
        return this;
    }

    /**
     * Procesa el pago
     * @param {Object} datos - Datos del pago
     * @throws {Error} Si el pago no puede ser procesado
     */
    pagar(datos) {
        throw new Error('Método pagar() no implementado.');
    }
}

/**
 * Medio de pago en efectivo
 */
export class PagoEfectivo extends MedioDePago {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.agregarValidador(new ValidadorPlazo());
        this.agregarValidador(new ValidadorDescuento());
    }

    /**
     * Procesa el pago en efectivo
     * @param {Object} datos - Datos del pago
     * @returns {Object} - Resultado del pago
     * @throws {Error} Si el pago no puede ser procesado
     */
    pagar(datos) {
        const { montoPagado, montoFactura } = datos;
        
        if (!montoPagado || !montoFactura) {
            throw new Error('Faltan datos para procesar el pago');
        }
        
        if (montoPagado < montoFactura) {
            throw new Error('El monto pagado es insuficiente.');
        }
        
        if (this.primerValidador) {
            this.primerValidador.ejecutar(datos);
        }
        
        return {
            exito: true,
            vuelto: montoPagado - montoFactura
        };
    }
}

/**
 * Medio de pago por transferencia
 */
export class PagoTransferencia extends MedioDePago {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.agregarValidador(new ValidadorPlazo());
        this.agregarValidador(new ValidadorCUIT());
        this.agregarValidador(new ValidadorTitularTransferencia());
        this.agregarValidador(new ValidadorDescuento());
    }

    /**
     * Procesa el pago por transferencia
     * @param {Object} datos - Datos del pago
     * @returns {Object} - Resultado del pago
     * @throws {Error} Si el pago no puede ser procesado
     */
    pagar(datos) {
        if (!datos.cuit || !datos.banco || !datos.titular) {
            throw new Error('Faltan datos para procesar la transferencia');
        }
        
        // Asegurar que el parámetro cliente esté disponible para el validador
        if (datos.nombreCliente) {
            datos.cliente = datos.nombreCliente;
        }
        
        if (this.primerValidador) {
            this.primerValidador.ejecutar(datos);
        }
        
        return {
            exito: true,
            comprobante: `TR-${Date.now()}-${datos.cuit.substring(0, 5)}`
        };
    }
}
