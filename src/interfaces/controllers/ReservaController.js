export class ReservaController {
    /**
     * Constructor
     * @param {ReservaService} reservaService - Reservation service
     */
    constructor(reservaService) {
        this.reservaService = reservaService;
    }

    /**
     * Create a new reservation
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async crearReserva(req, res) {
        try {
            const reservaData = req.body;
            const reserva = await this.reservaService.crearReserva(reservaData);
            res.status(201).json(reserva);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Cancel a reservation
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async cancelarReserva(req, res) {
        try {
            const { id } = req.params;
            const result = await this.reservaService.cancelarReserva(id);
            res.status(200).json({ success: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Add to waiting list
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async agregarListaEspera(req, res) {
        try {
            const reservaData = req.body;
            const reserva = await this.reservaService.agregarListaEspera(reservaData);
            res.status(201).json(reserva);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Remove from waiting list
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async eliminarListaEspera(req, res) {
        try {
            const { id } = req.params;
            const result = await this.reservaService.eliminarListaEspera(id);
            res.status(200).json({ success: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Process payment for a reservation
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async procesarPago(req, res) {
        try {
            const { id } = req.params;
            const reserva = await this.reservaService.procesarPago(id);
            res.status(200).json(reserva);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
