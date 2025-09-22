import { NovoHistoricoEscolar, HistoricoEscolar } from '../entities/historico_escolar.js';

export class HistoricoEscolarService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     * @param {import('../repositories/historico_escolar.repository.js').HistoricoEscolarRepository} historicoEscolarRepository
     */
    constructor(db, historicoEscolarRepository) {
        this.db = db;
        this.historicoEscolarRepository = historicoEscolarRepository;
    }

    /**
     * Lista todos os históricos escolares
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async list() {
        return await this.historicoEscolarRepository.list();
    }

    /**
     * Busca um histórico escolar pelo ID
     * @param {number} id
     * @returns {Promise<HistoricoEscolar|null>}
     */
    async getById(id) {
        return await this.historicoEscolarRepository.getById(id);
    }

    /**
     * Busca históricos escolares por aluno ID
     * @param {number} alunoId
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async getByAlunoId(alunoId) {
        return await this.historicoEscolarRepository.getByAlunoId(alunoId);
    }

    /**
     * Busca históricos escolares por disciplina ID
     * @param {number} disciplinaId
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async getByDisciplinaId(disciplinaId) {
        return await this.historicoEscolarRepository.getByDisciplinaId(disciplinaId);
    }

    /**
     * Cria um novo histórico escolar
     * @param {NovoHistoricoEscolar} novoHistoricoEscolar
     * @returns {Promise<HistoricoEscolar>}
     */
    async create(novoHistoricoEscolar) {
        return await this.historicoEscolarRepository.create(novoHistoricoEscolar);
    }

    /**
     * Atualiza dados do histórico escolar
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<HistoricoEscolar>}
     */
    async update(id, updateData) {
        return await this.historicoEscolarRepository.update(id, updateData);
    }

    /**
     * Deleta um histórico escolar
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        await this.historicoEscolarRepository.delete(id);
    }
}