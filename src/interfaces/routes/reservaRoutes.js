import express from 'express';
import { ReservaController } from '../controllers/ReservaController.js';

/**
 * Create reservation routes
 * @param {ReservaController} reservaController - Reservation controller
 * @returns {express.Router} - Router
 */
export function createReservaRoutes(reservaController) {
    const router = express.Router();

    // Create a new reservation
    router.post('/', (req, res) => reservaController.crearReserva(req, res));

    // Cancel a reservation
    router.delete('/:id', (req, res) => reservaController.cancelarReserva(req, res));

    // Add to waiting list
    router.post('/lista-espera', (req, res) => reservaController.agregarListaEspera(req, res));

    // Remove from waiting list
    router.delete('/lista-espera/:id', (req, res) => reservaController.eliminarListaEspera(req, res));

    // Process payment for a reservation
    router.post('/:id/pago', (req, res) => reservaController.procesarPago(req, res));

    return router;
}
