import { NovaFalta, Falta } from '../entities/falta.js';

export class FaltaService {
    constructor(db, faltaRepository) {
        this.db = db;
        this.faltaRepository = faltaRepository;
    }

    async list(filters = {}) {
        // Validação de filtros
        if (filters.dataInicio && filters.dataFim && filters.dataInicio > filters.dataFim) {
            throw new Error('Data início não pode ser maior que data fim');
        }
        const faltas = await this.faltaRepository.list(filters);
        
        // Converter para entities Falta
        return faltas.map(falta => Falta.fromController(falta));
    }

    async getById(id) {
        if (!id) {
            throw new Error('ID é obrigatório');
        }
        const falta = await this.faltaRepository.getById(id);
        return Falta.fromController(falta);
    }

    async create(dadosFalta) {
        // Criar entity NovaFalta para validação
        const novaFalta = new NovaFalta(dadosFalta);
        
        const faltaExistente = await this.faltaRepository.verificarFaltaExistente(
            novaFalta.idAluno, 
            novaFalta.data.toISOString().split('T')[0],
            novaFalta.periodo
        );
        
        if (faltaExistente) {
            throw new Error('Já existe uma falta registrada para este aluno nesta data' + 
                (novaFalta.periodo ? ` no período ${novaFalta.periodo}` : ''));
        }

        // Converter para formato do controller e criar
        const dadosController = novaFalta.toController();
        const faltaCriada = await this.faltaRepository.create(dadosController);
        
        return Falta.fromController(faltaCriada);
    }

    async update(id, updateData) {
        if (!id) {
            throw new Error('ID é obrigatório');
        }
        
        // Verificar se a falta existe
        const faltaExistente = await this.faltaRepository.getById(id);
        if (!faltaExistente) {
            throw new Error('Falta não encontrada');
        }

        // Validar dados de atualização
        if (updateData.data) {
            const dataFalta = new Date(updateData.data);
            const hoje = new Date();
            if (dataFalta > hoje) {
                throw new Error('Não é possível registrar falta para data futura');
            }
        }

        const faltaAtualizada = await this.faltaRepository.update(id, updateData);
        return Falta.fromController(faltaAtualizada);
    }

    async delete(id) {
        if (!id) {
            throw new Error('ID é obrigatório');
        }
        
        // Verificar se a falta existe
        const faltaExistente = await this.faltaRepository.getById(id);
        if (!faltaExistente) {
            throw new Error('Falta não encontrada');
        }

        await this.faltaRepository.delete(id);
    }

    async createMultiple(faltasData) {
        if (!Array.isArray(faltasData) || faltasData.length === 0) {
            throw new Error('Array de faltas é obrigatório');
        }

        // Validar e converter cada falta
        const faltasValidadas = [];
        for (const dadosFalta of faltasData) {
            const novaFalta = new NovaFalta(dadosFalta);
            faltasValidadas.push(novaFalta.toController());
        }

        const faltasCriadas = await this.faltaRepository.createMultiple(faltasValidadas);
        return faltasCriadas.map(falta => Falta.fromController(falta));
    }

    async getByAlunoId(alunoId, dataInicio, dataFim) {
        if (!alunoId) {
            throw new Error('ID do aluno é obrigatório');
        }
        const faltas = await this.faltaRepository.getByAlunoId(alunoId, dataInicio, dataFim);
        return faltas.map(falta => Falta.fromController(falta));
    }

    async getByTurmaId(turmaId, data) {
        if (!turmaId || !data) {
            throw new Error('Turma ID e data são obrigatórios');
        }
        const faltas = await this.faltaRepository.getByTurmaId(turmaId, data);
        return faltas.map(falta => Falta.fromController(falta));
    }

    async getEstatisticas(filters = {}) {
        return await this.faltaRepository.getEstatisticas(filters);
    }

    validarFalta(dadosFalta) {
        const falta = new NovaFalta(dadosFalta);    
        return falta;
    }

    async verificarFaltasAluno(alunoId, data, periodo = null) {
        if (!alunoId || !data) {
            throw new Error('ID do aluno e data são obrigatórios');
        }

        const faltas = await this.faltaRepository.getByAlunoId(alunoId, data, data);
        
        if (periodo !== null) {
            return faltas.find(falta => falta.periodo === periodo);
        } else {
            return faltas.find(falta => falta.periodo === null);
        }
    }
}