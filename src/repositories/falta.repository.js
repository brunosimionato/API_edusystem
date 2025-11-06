import { NovaFalta, Falta } from '../entities/falta.js';

export class FaltaRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
        let query = 'SELECT * FROM faltas WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (filters.idAluno) {
            paramCount++;
            query += ` AND id_aluno = $${paramCount}`;
            params.push(filters.idAluno);
        }

        if (filters.idTurma) {
            paramCount++;
            query += ` AND id_turma = $${paramCount}`;
            params.push(filters.idTurma);
        }

        if (filters.data) {
            paramCount++;
            query += ` AND data = $${paramCount}`;
            params.push(filters.data);
        }

        if (filters.dataInicio && filters.dataFim) {
            paramCount++;
            query += ` AND data BETWEEN $${paramCount}`;
            params.push(filters.dataInicio);
            paramCount++;
            query += ` AND $${paramCount}`;
            params.push(filters.dataFim);
        }

        query += ' ORDER BY data DESC, id_aluno';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getById(id) {
        const res = await this.db.query('SELECT * FROM faltas WHERE id_faltas = $1', [id]);
        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async create(novaFalta) {
        const res = await this.db.query(
            `INSERT INTO faltas (
                id_aluno, id_turma, data, periodo, justificada, observacao
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                novaFalta.idAluno,
                novaFalta.idTurma,
                novaFalta.data,
                novaFalta.periodo,
                novaFalta.justificada,
                novaFalta.observacao
            ]
        );

        const row = res.rows[0];
        return Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE faltas SET 
                periodo = $1,
                justificada = $2,
                observacao = $3,
                updated_at = NOW()
            WHERE id_faltas = $4 RETURNING *`,
            [
                updateData.periodo,
                updateData.justificada,
                updateData.observacao,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Falta não encontrada");

        const row = res.rows[0];
        return Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async delete(id) {
        const res = await this.db.query("DELETE FROM faltas WHERE id_faltas = $1", [id]);
        if (res.rowCount === 0) throw new Error("Falta não encontrada");
    }

    async createMultiple(faltasData) {
        const values = [];
        const params = [];
        let paramCount = 0;

        faltasData.forEach((falta, index) => {
            const base = index * 6;
            values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
            
            params.push(falta.idAluno);
            params.push(falta.idTurma);
            params.push(falta.data);
            params.push(falta.periodo);
            params.push(falta.justificada);
            params.push(falta.observacao);
        });

        const query = `
            INSERT INTO faltas (id_aluno, id_turma, data, periodo, justificada, observacao)
            VALUES ${values.join(', ')}
            RETURNING *
        `;

        const res = await this.db.query(query, params);
        return res.rows.map(row => Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getByAlunoId(alunoId, dataInicio, dataFim) {
        let query = 'SELECT * FROM faltas WHERE id_aluno = $1';
        const params = [alunoId];

        if (dataInicio && dataFim) {
            params.push(dataInicio, dataFim);
            query += ` AND data BETWEEN $2 AND $3`;
        }

        query += ' ORDER BY data DESC';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getByTurmaId(turmaId, data) {
        let query = 'SELECT * FROM faltas WHERE id_turma = $1';
        const params = [turmaId];

        if (data) {
            params.push(data);
            query += ` AND data = $2`;
        }

        query += ' ORDER BY data DESC, id_aluno';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Falta.fromObj({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            idTurma: row.id_turma,
            data: row.data,
            periodo: row.periodo,
            justificada: row.justificada,
            observacao: row.observacao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
}