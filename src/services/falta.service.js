import { NovaFalta, Falta } from '../entities/falta.js';

export class FaltaService {
    constructor(db, faltaRepository) {
        this.db = db;
        this.faltaRepository = faltaRepository;
    }

    async list(filters = {}) {
        return await this.faltaRepository.list(filters);
    }

    async getById(id) {
        return await this.faltaRepository.getById(id);
    }

    async create(novaFalta) {
        return await this.faltaRepository.create(novaFalta);
    }

    async update(id, updateData) {
        return await this.faltaRepository.update(id, updateData);
    }

    async delete(id) {
        await this.faltaRepository.delete(id);
    }

    async createMultiple(faltasData) {
        return await this.faltaRepository.createMultiple(faltasData);
    }

    async getByAlunoId(alunoId, dataInicio, dataFim) {
        return await this.faltaRepository.getByAlunoId(alunoId, dataInicio, dataFim);
    }

    async getByTurmaId(turmaId, data) {
        return await this.faltaRepository.getByTurmaId(turmaId, data);
    }
}