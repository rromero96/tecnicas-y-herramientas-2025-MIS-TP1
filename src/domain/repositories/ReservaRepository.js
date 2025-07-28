export class ReservaRepository {
    /**
     * Get all reservations
     * @returns {Promise<Array>} - List of reservations
     */
    async getAll() {
        throw new Error("Method 'getAll' must be implemented by derived classes");
    }

    /**
     * Get reservations by experience ID
     * @param {string} experienciaId - Experience ID
     * @returns {Promise<Array>} - List of reservations
     */
    async getByExperienciaId(experienciaId) {
        throw new Error("Method 'getByExperienciaId' must be implemented by derived classes");
    }

    /**
     * Get reservation by ID
     * @param {string} id - Reservation ID
     * @returns {Promise<Object>} - Reservation
     */
    async getById(id) {
        throw new Error("Method 'getById' must be implemented by derived classes");
    }

    /**
     * Save reservation
     * @param {Object} reserva - Reservation to save
     * @returns {Promise<Object>} - Saved reservation
     */
    async save(reserva) {
        throw new Error("Method 'save' must be implemented by derived classes");
    }

    /**
     * Update reservation
     * @param {string} id - Reservation ID
     * @param {Object} reserva - Updated reservation data
     * @returns {Promise<Object>} - Updated reservation
     */
    async update(id, reserva) {
        throw new Error("Method 'update' must be implemented by derived classes");
    }

    /**
     * Delete reservation
     * @param {string} id - Reservation ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        throw new Error("Method 'delete' must be implemented by derived classes");
    }
}
