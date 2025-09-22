import { NovoAluno, Aluno } from '../entities/aluno.js';

export class AlunoService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     * @param {import('../repositories/aluno.repository.js').AlunoRepository} alunoRepository
     */
    constructor(db, alunoRepository) {
        this.db = db;
        this.alunoRepository = alunoRepository;
    }

    /**
     * Lista todos os alunos
     * @returns {Promise<Aluno[]>}
     */
    async list() {
        return await this.alunoRepository.list();
    }

    /**
     * Busca um aluno pelo ID
     * @param {number} id
     * @returns {Promise<Aluno|null>}
     */
    async getById(id) {
        return await this.alunoRepository.getById(id);
    }

    /**
     * Cria um novo aluno
     * @param {NovoAluno} novoAluno
     * @returns {Promise<Aluno>}
     */
    async create(novoAluno) {
        return await this.alunoRepository.create(novoAluno);
    }

    /**
     * Atualiza dados do aluno
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Aluno>}
     */
    async update(id, updateData) {
        return await this.alunoRepository.update(id, updateData);
    }

    /**
     * Deleta um aluno
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        await this.alunoRepository.delete(id);
    }
}