import { ReservaRepository } from '../../domain/repositories/ReservaRepository.js';

export class InMemoryReservaRepository extends ReservaRepository {
    constructor() {
        super();
        this.reservas = new Map();
        this.nextId = 1;
    }

    /**
     * Get all reservations
     * @returns {Promise<Array>} - List of reservations
     */
    async getAll() {
        return Array.from(this.reservas.values());
    }

    /**
     * Get reservations by experience ID
     * @param {string} experienciaId - Experience ID
     * @returns {Promise<Array>} - List of reservations
     */
    async getByExperienciaId(experienciaId) {
        const reservas = Array.from(this.reservas.values());
        return reservas.filter(reserva => reserva.experiencia.id === experienciaId);
    }

    /**
     * Get reservation by ID
     * @param {string} id - Reservation ID
     * @returns {Promise<Object>} - Reservation
     */
    async getById(id) {
        return this.reservas.get(id) || null;
    }

    /**
     * Save reservation
     * @param {Object} reserva - Reservation to save
     * @returns {Promise<Object>} - Saved reservation
     */
    async save(reserva) {
        const id = this.nextId.toString();
        this.nextId++;
        
        reserva.id = id;
        this.reservas.set(id, reserva);
        
        return reserva;
    }

    /**
     * Update reservation
     * @param {string} id - Reservation ID
     * @param {Object} reserva - Updated reservation data
     * @returns {Promise<Object>} - Updated reservation
     */
    async update(id, reserva) {
        if (!this.reservas.has(id)) {
            throw new Error(`No se encontró la reserva con ID: ${id}`);
        }
        
        reserva.id = id;
        this.reservas.set(id, reserva);
        
        return reserva;
    }

    /**
     * Delete reservation
     * @param {string} id - Reservation ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        if (!this.reservas.has(id)) {
            throw new Error(`No se encontró la reserva con ID: ${id}`);
        }
        
        return this.reservas.delete(id);
    }
}
