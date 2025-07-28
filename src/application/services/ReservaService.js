import { Reserva } from '../../domain/entities/Reserva.js';

export class ReservaService {
    /**
     * Constructor
     * @param {ReservaRepository} reservaRepository - Reservation repository
     * @param {ExperienciaRepository} experienciaRepository - Experience repository
     */
    constructor(reservaRepository, experienciaRepository) {
        this.reservaRepository = reservaRepository;
        this.experienciaRepository = experienciaRepository;
    }

    /**
     * Create a new reservation
     * @param {Object} reservaData - Reservation data
     * @returns {Promise<Reserva>} - Created reservation
     */
    async crearReserva(reservaData) {
        const { nombre, email, experienciaId, plazoLimite, fecha, options } = reservaData;
        
        // Get the experience
        const experiencia = await this.experienciaRepository.getById(experienciaId);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${experienciaId}`);
        }
        
        // Check availability
        if (!experiencia.getDisponibilidad(fecha)) {
            throw new Error("La fecha no está disponible para la reserva, puede sumarse a la lista de espera.");
        }
        
        // Create reservation
        const precio = experiencia.getPrecioTotal();
        const reserva = new Reserva(nombre, email, experiencia, plazoLimite, fecha, precio, options);
        
        // Confirm reservation
        reserva.confirmar();
        
        // Save reservation
        return await this.reservaRepository.save(reserva);
    }

    /**
     * Cancel a reservation
     * @param {string} reservaId - Reservation ID
     * @returns {Promise<boolean>} - Success status
     */
    async cancelarReserva(reservaId) {
        // Get the reservation
        const reserva = await this.reservaRepository.getById(reservaId);
        if (!reserva) {
            throw new Error(`No se encontró la reserva con ID: ${reservaId}`);
        }
        
        // Cancel reservation
        reserva.cancelar();
        
        // Delete reservation
        return await this.reservaRepository.delete(reservaId);
    }

    /**
     * Add to waiting list
     * @param {Object} reservaData - Reservation data
     * @returns {Promise<Reserva>} - Created reservation
     */
    async agregarListaEspera(reservaData) {
        const { nombre, email, experienciaId, plazoLimite, fecha, options } = reservaData;
        
        // Get the experience
        const experiencia = await this.experienciaRepository.getById(experienciaId);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${experienciaId}`);
        }
        
        // Check if date is unavailable
        if (experiencia.getDisponibilidad(fecha)) {
            throw new Error("La fecha está disponible para la reserva, no es necesario agregar a la lista de espera.");
        }
        
        // Create reservation
        const precio = experiencia.getPrecioTotal();
        const reserva = new Reserva(nombre, email, experiencia, plazoLimite, fecha, precio, options);
        
        // Add to waiting list
        reserva.agregarListaEspera();
        
        // Save reservation
        return await this.reservaRepository.save(reserva);
    }

    /**
     * Remove from waiting list
     * @param {string} reservaId - Reservation ID
     * @returns {Promise<boolean>} - Success status
     */
    async eliminarListaEspera(reservaId) {
        // Get the reservation
        const reserva = await this.reservaRepository.getById(reservaId);
        if (!reserva) {
            throw new Error(`No se encontró la reserva con ID: ${reservaId}`);
        }
        
        // Remove from waiting list
        reserva.eliminarListaEspera();
        
        // Delete reservation
        return await this.reservaRepository.delete(reservaId);
    }

    /**
     * Process payment for a reservation
     * @param {string} reservaId - Reservation ID
     * @returns {Promise<Reserva>} - Updated reservation
     */
    async procesarPago(reservaId) {
        // Get the reservation
        const reserva = await this.reservaRepository.getById(reservaId);
        if (!reserva) {
            throw new Error(`No se encontró la reserva con ID: ${reservaId}`);
        }
        
        // Process payment
        reserva.pagar();
        
        // Update reservation
        return await this.reservaRepository.update(reservaId, reserva);
    }
}
