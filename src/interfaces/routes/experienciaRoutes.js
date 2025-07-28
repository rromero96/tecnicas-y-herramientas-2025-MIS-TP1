import express from 'express';
import { ExperienciaController } from '../controllers/ExperienciaController.js';

/**
 * Create experience routes
 * @param {ExperienciaController} experienciaController - Experience controller
 * @returns {express.Router} - Router
 */
export function createExperienciaRoutes(experienciaController) {
    const router = express.Router();

    // Get all experiences
    router.get('/', (req, res) => experienciaController.getAllExperiencias(req, res));

    // Get experience by ID
    router.get('/:id', (req, res) => experienciaController.getExperienciaById(req, res));

    // Create a new experience
    router.post('/', (req, res) => experienciaController.crearExperiencia(req, res));

    // Update experience
    router.put('/:id', (req, res) => experienciaController.actualizarExperiencia(req, res));

    // Delete experience
    router.delete('/:id', (req, res) => experienciaController.eliminarExperiencia(req, res));

    // Add availability date
    router.post('/:id/disponibilidad', (req, res) => experienciaController.agregarFechaDisponibilidad(req, res));

    // Set waiting list strategy
    router.post('/:id/estrategia', (req, res) => experienciaController.setEstrategiaListaEspera(req, res));

    return router;
}
