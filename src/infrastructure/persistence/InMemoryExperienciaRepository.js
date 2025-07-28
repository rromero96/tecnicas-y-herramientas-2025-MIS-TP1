import { ExperienciaRepository } from '../../domain/repositories/ExperienciaRepository.js';

export class InMemoryExperienciaRepository extends ExperienciaRepository {
    constructor() {
        super();
        this.experiencias = new Map();
        this.nextId = 1;
    }

    /**
     * Get all experiences
     * @returns {Promise<Array>} - List of experiences
     */
    async getAll() {
        return Array.from(this.experiencias.values());
    }

    /**
     * Get experience by ID
     * @param {string} id - Experience ID
     * @returns {Promise<Object>} - Experience
     */
    async getById(id) {
        return this.experiencias.get(id) || null;
    }

    /**
     * Save experience
     * @param {Object} experiencia - Experience to save
     * @returns {Promise<Object>} - Saved experience
     */
    async save(experiencia) {
        const id = this.nextId.toString();
        this.nextId++;
        
        experiencia.id = id;
        this.experiencias.set(id, experiencia);
        
        return experiencia;
    }

    /**
     * Update experience
     * @param {string} id - Experience ID
     * @param {Object} experiencia - Updated experience data
     * @returns {Promise<Object>} - Updated experience
     */
    async update(id, experiencia) {
        if (!this.experiencias.has(id)) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        experiencia.id = id;
        this.experiencias.set(id, experiencia);
        
        return experiencia;
    }

    /**
     * Delete experience
     * @param {string} id - Experience ID
     * @returns {Promise<boolean>} - Success status
     */
    async delete(id) {
        if (!this.experiencias.has(id)) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        return this.experiencias.delete(id);
    }
}
