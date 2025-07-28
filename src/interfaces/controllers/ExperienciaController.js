export class ExperienciaController {
    /**
     * Constructor
     * @param {ExperienciaService} experienciaService - Experience service
     */
    constructor(experienciaService) {
        this.experienciaService = experienciaService;
    }

    /**
     * Get all experiences
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getAllExperiencias(req, res) {
        try {
            const experiencias = await this.experienciaService.getAllExperiencias();
            res.status(200).json(experiencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get experience by ID
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async getExperienciaById(req, res) {
        try {
            const { id } = req.params;
            const experiencia = await this.experienciaService.getExperienciaById(id);
            res.status(200).json(experiencia);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    /**
     * Create a new experience
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async crearExperiencia(req, res) {
        try {
            const experienciaData = req.body;
            const experiencia = await this.experienciaService.crearExperiencia(experienciaData);
            res.status(201).json(experiencia);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Update experience
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async actualizarExperiencia(req, res) {
        try {
            const { id } = req.params;
            const experienciaData = req.body;
            const experiencia = await this.experienciaService.actualizarExperiencia(id, experienciaData);
            res.status(200).json(experiencia);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Delete experience
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async eliminarExperiencia(req, res) {
        try {
            const { id } = req.params;
            const result = await this.experienciaService.eliminarExperiencia(id);
            res.status(200).json({ success: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Add availability date
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async agregarFechaDisponibilidad(req, res) {
        try {
            const { id } = req.params;
            const { fecha } = req.body;
            const experiencia = await this.experienciaService.agregarFechaDisponibilidad(id, fecha);
            res.status(200).json(experiencia);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Set waiting list strategy
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     */
    async setEstrategiaListaEspera(req, res) {
        try {
            const { id } = req.params;
            const { tipoEstrategia } = req.body;
            const experiencia = await this.experienciaService.setEstrategiaListaEspera(id, tipoEstrategia);
            res.status(200).json(experiencia);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
