export class ExperienciaRepository {
    /**
     * Get all experiences
     * @returns {Promise<Array>} - List of experiences
     */
    async getAll() {
        throw new Error("Method 'getAll' must be implemented by derived classes");
    }

    /**
     * Get experience by ID
     * @param {string} id - Experience ID
     * @returns {Promise<Object>} - Experience
     */
    async getById(id) {
        throw new Error("Method 'getById' must be implemented by derived classes");
    }

    /**
     * Save experience
     * @param {Object} experiencia - Experience to save
     * @returns {Promise<Object>} - Saved experience
     */
    async save(experiencia) {
        throw new Error("Method 'save' must be implemented by derived classes");
    }

    /**
     * Update experience
     * @param {string} id - Experience ID
     * @param {Object} experiencia - Updated experience data
     * @returns {Promise<Object>} - Updated experience
     */
    async update(id, experiencia) {
        throw new Error("Method 'update' must be implemented by derived classes");
    }

    /**
     * Delete experience
     * @param {string} id - Experience ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        throw new Error("Method 'delete' must be implemented by derived classes");
    }
}
