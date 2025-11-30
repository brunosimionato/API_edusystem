import { NovoHorario, Horario } from '../entities/horario.js';

export class HorarioService {
    constructor(db, horarioRepository) {
        this.db = db;
        this.horarioRepository = horarioRepository;
    }

    async list(filters = {}) {
        try {
            return await this.horarioRepository.list(filters);
        } catch (error) {
            console.error('Erro ao listar horários:', error);
            throw new Error('Erro ao buscar horários: ' + error.message);
        }
    }

    async getById(id) {
        try {
            const horario = await this.horarioRepository.getById(id);
            if (!horario) {
                throw new Error('Horário não encontrado');
            }
            return horario;
        } catch (error) {
            console.error('Erro ao buscar horário:', error);
            throw new Error('Erro ao buscar horário: ' + error.message);
        }
    }

    async create(horarioData) {
        try {
            const novoHorario = new NovoHorario(horarioData);
            
            return await this.horarioRepository.create(novoHorario);
        } catch (error) {
            console.error('Erro ao criar horário:', error);
            
            if (error.message.includes('ZodError') || error.message.includes('validation')) {
                throw error;
            }
            
            throw new Error('Erro ao criar horário: ' + error.message);
        }
    }

    async update(id, updateData) {
        try {
            // Verificar se o horário existe
            const horarioExistente = await this.horarioRepository.getById(id);
            if (!horarioExistente) {
                throw new Error('Horário não encontrado');
            }

            return await this.horarioRepository.update(id, updateData);
        } catch (error) {
            console.error('Erro ao atualizar horário:', error);
            
            // Se for erro de validação, manter a mensagem original
            if (error.message.includes('ZodError') || error.message.includes('validation')) {
                throw error;
            }
            
            throw new Error('Erro ao atualizar horário: ' + error.message);
        }
    }

    async delete(id) {
        try {
            // Verificar se o horário existe antes de deletar
            const horarioExistente = await this.horarioRepository.getById(id);
            if (!horarioExistente) {
                throw new Error('Horário não encontrado');
            }

            await this.horarioRepository.delete(id);
        } catch (error) {
            console.error('Erro ao deletar horário:', error);
            throw new Error('Erro ao deletar horário: ' + error.message);
        }
    }

    async getByTurmaId(turmaId) {
        try {
            if (!turmaId) {
                throw new Error('ID da turma é obrigatório');
            }
            return await this.horarioRepository.getByTurmaId(turmaId);
        } catch (error) {
            console.error('Erro ao buscar horários da turma:', error);
            throw new Error('Erro ao buscar horários da turma: ' + error.message);
        }
    }

    async getByProfessorId(professorId) {
        try {
            if (!professorId) {
                throw new Error('ID do professor é obrigatório');
            }
            return await this.horarioRepository.getByProfessorId(professorId);
        } catch (error) {
            console.error('Erro ao buscar horários do professor:', error);
            throw new Error('Erro ao buscar horários do professor: ' + error.message);
        }
    }

    async getGradeHorarios(turmaId) {
        try {
            if (!turmaId) {
                throw new Error('ID da turma é obrigatório');
            }
            return await this.horarioRepository.getGradeHorarios(turmaId);
        } catch (error) {
            console.error('Erro ao buscar grade de horários:', error);
            throw new Error('Erro ao buscar grade de horários: ' + error.message);
        }
    }

    async buscarHorarios(filters = {}) {
        try {
            return await this.horarioRepository.list(filters);
        } catch (error) {
            console.error('Erro ao buscar horários com filtros:', error);
            throw new Error('Erro ao buscar horários: ' + error.message);
        }
    }
}