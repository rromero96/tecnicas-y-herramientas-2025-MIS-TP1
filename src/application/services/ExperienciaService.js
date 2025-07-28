import { ListaEsperaStrategyFactory, TipoEstrategia } from '../../infrastructure/strategies/ListaEsperaStrategyFactory.js';

export class ExperienciaService {
    /**
     * Constructor
     * @param {ExperienciaRepository} experienciaRepository - Experience repository
     */
    constructor(experienciaRepository) {
        this.experienciaRepository = experienciaRepository;
    }

    /**
     * Get all experiences
     * @returns {Promise<Array>} - List of experiences
     */
    async getAllExperiencias() {
        return await this.experienciaRepository.getAll();
    }

    /**
     * Get experience by ID
     * @param {string} id - Experience ID
     * @returns {Promise<Object>} - Experience
     */
    async getExperienciaById(id) {
        const experiencia = await this.experienciaRepository.getById(id);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        return experiencia;
    }

    /**
     * Create a new experience
     * @param {Object} experienciaData - Experience data
     * @returns {Promise<Object>} - Created experience
     */
    async crearExperiencia(experienciaData) {
        // Implementation depends on the specific experience type
        // This would be implemented in subclass services
        throw new Error("Method 'crearExperiencia' must be implemented by derived classes");
    }

    /**
     * Update experience
     * @param {string} id - Experience ID
     * @param {Object} experienciaData - Updated experience data
     * @returns {Promise<Object>} - Updated experience
     */
    async actualizarExperiencia(id, experienciaData) {
        const experiencia = await this.experienciaRepository.getById(id);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        // Update experience properties
        // Implementation depends on the specific experience type
        
        return await this.experienciaRepository.update(id, experiencia);
    }

    /**
     * Delete experience
     * @param {string} id - Experience ID
     * @returns {Promise<boolean>} - Success status
     */
    async eliminarExperiencia(id) {
        const experiencia = await this.experienciaRepository.getById(id);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        return await this.experienciaRepository.delete(id);
    }

    /**
     * Add availability date
     * @param {string} id - Experience ID
     * @param {string} fecha - Date to add
     * @returns {Promise<Object>} - Updated experience
     */
    async agregarFechaDisponibilidad(id, fecha) {
        const experiencia = await this.experienciaRepository.getById(id);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        experiencia.agregarFechaEnDisponibilidad(fecha);
        
        return await this.experienciaRepository.update(id, experiencia);
    }

    /**
     * Set waiting list strategy
     * @param {string} id - Experience ID
     * @param {string} tipoEstrategia - Strategy type
     * @returns {Promise<Object>} - Updated experience
     */
    async setEstrategiaListaEspera(id, tipoEstrategia) {
        const experiencia = await this.experienciaRepository.getById(id);
        if (!experiencia) {
            throw new Error(`No se encontró la experiencia con ID: ${id}`);
        }
        
        // Validate strategy type
        if (!Object.values(TipoEstrategia).includes(tipoEstrategia)) {
            throw new Error(`Tipo de estrategia no válido: ${tipoEstrategia}`);
        }
        
        // Set strategy
        experiencia.setEstrategiaListaDeEspera(tipoEstrategia);
        
        return await this.experienciaRepository.update(id, experiencia);
    }
}
