import { NovoHorario, Horario } from '../entities/horario.js';

export class HorarioService {
    constructor(db, horarioRepository) {
        this.db = db;
        this.horarioRepository = horarioRepository;
    }

    async list(filters = {}) {
        return await this.horarioRepository.list(filters);
    }

    async getById(id) {
        return await this.horarioRepository.getById(id);
    }

    async create(novoHorario) {
        // Verificar conflito antes de criar
        const hasConflito = await this.horarioRepository.hasConflito(novoHorario);
        if (hasConflito) {
            throw new Error('Conflito de horário detectado. Já existe um horário para este professor no mesmo dia e período.');
        }

        return await this.horarioRepository.create(novoHorario);
    }

    async update(id, updateData) {
        // Verificar conflito antes de atualizar
        const hasConflito = await this.horarioRepository.hasConflito({
            ...updateData,
            id
        });
        if (hasConflito) {
            throw new Error('Conflito de horário detectado. Já existe um horário para este professor no mesmo dia e período.');
        }

        return await this.horarioRepository.update(id, updateData);
    }

    async delete(id) {
        await this.horarioRepository.delete(id);
    }

    async getByTurmaId(turmaId) {
        return await this.horarioRepository.getByTurmaId(turmaId);
    }

    async getByProfessorId(professorId) {
        return await this.horarioRepository.getByProfessorId(professorId);
    }

    async getGradeHorarios(turmaId) {
        return await this.horarioRepository.getGradeHorarios(turmaId);
    }

    async hasConflito(horarioData) {
        return await this.horarioRepository.hasConflito(horarioData);
    }
}