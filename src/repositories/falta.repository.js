import { NovaFalta, Falta } from '../entities/falta.js';

export class FaltaRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
        let query = `
            SELECT 
                f.*,
                a.nome as aluno_nome
            FROM faltas f
            LEFT JOIN alunos a ON f.id_aluno = a.id_alunos
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.aluno_id) {
            paramCount++;
            query += ` AND f.id_aluno = $${paramCount}`;
            params.push(filters.aluno_id);
        }

        if (filters.data_inicio) {
            paramCount++;
            query += ` AND f.data_falta >= $${paramCount}`;
            params.push(filters.data_inicio);
        }

        if (filters.data_fim) {
            paramCount++;
            query += ` AND f.data_falta <= $${paramCount}`;
            params.push(filters.data_fim);
        }

        query += ' ORDER BY f.data_falta DESC, f.created_at DESC';

        if (filters.page && filters.limit) {
            const offset = (parseInt(filters.page) - 1) * parseInt(filters.limit);
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(parseInt(filters.limit));

            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(offset);
        }

        const res = await this.db.query(query, params);
        return res.rows.map(row => ({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            aluno: {
                id: row.id_aluno,
                nome: row.aluno_nome
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getById(id) {
        const res = await this.db.query(
            `SELECT 
                f.*,
                a.nome as aluno_nome
            FROM faltas f
            LEFT JOIN alunos a ON f.id_aluno = a.id_alunos
            WHERE f.id_faltas = $1`, 
            [id]
        );
        
        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return {
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            aluno: {
                id: row.id_aluno,
                nome: row.aluno_nome
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async create(dadosFalta) {
        const res = await this.db.query(
            `INSERT INTO faltas (
                id_aluno, data_falta, periodo
            ) VALUES ($1, $2, $3) RETURNING *`,
            [
                dadosFalta.idAluno,
                dadosFalta.data,
                dadosFalta.periodo || null
            ]
        );

        const row = res.rows[0];
        return {
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE faltas SET 
                data_falta = COALESCE($1, data_falta),
                periodo = COALESCE($2, periodo),
                updated_at = NOW()
            WHERE id_faltas = $3 RETURNING *`,
            [
                updateData.data,
                updateData.periodo,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Falta não encontrada");

        const row = res.rows[0];
        return {
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    async delete(id) {
        const res = await this.db.query(
            "DELETE FROM faltas WHERE id_faltas = $1 RETURNING *", 
            [id]
        );
        if (res.rows.length === 0) throw new Error("Falta não encontrada");
    }

    async verificarFaltaExistente(idAluno, data, periodo = null) {
        let query = `SELECT id_faltas FROM faltas WHERE id_aluno = $1 AND data_falta = $2`;
        const params = [idAluno, data];
        
        if (periodo !== null) {
            query += ` AND periodo = $3`;
            params.push(periodo);
        } else {
            query += ` AND periodo IS NULL`;
        }

        const res = await this.db.query(query, params);
        return res.rows.length > 0;
    }

    async createMultiple(faltasData) {
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            const faltasInseridas = [];
            
            for (const falta of faltasData) {
                const res = await client.query(
                    `INSERT INTO faltas (id_aluno, data_falta, periodo)
                     VALUES ($1, $2, $3) RETURNING *`,
                    [falta.idAluno, falta.data, falta.periodo || null]
                );
                
                faltasInseridas.push({
                    id: res.rows[0].id_faltas,
                    idAluno: res.rows[0].id_aluno,
                    data: res.rows[0].data_falta,
                    periodo: res.rows[0].periodo,
                    createdAt: res.rows[0].created_at,
                    updatedAt: res.rows[0].updated_at
                });
            }
            
            await client.query('COMMIT');
            return faltasInseridas;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getByAlunoId(alunoId, dataInicio, dataFim) {
        let query = `
            SELECT 
                f.*
            FROM faltas f
            WHERE f.id_aluno = $1
        `;
        const params = [alunoId];
        let paramCount = 1;

        if (dataInicio) {
            paramCount++;
            query += ` AND f.data_falta >= $${paramCount}`;
            params.push(dataInicio);
        }

        if (dataFim) {
            paramCount++;
            query += ` AND f.data_falta <= $${paramCount}`;
            params.push(dataFim);
        }

        query += ' ORDER BY f.data_falta DESC';

        const res = await this.db.query(query, params);
        return res.rows.map(row => ({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getByTurmaId(turmaId, data) {
        let query = `
            SELECT 
                f.*,
                a.nome as aluno_nome
            FROM faltas f
            LEFT JOIN alunos a ON f.id_aluno = a.id_alunos
            WHERE a.id_turma = $1
        `;
        const params = [turmaId];

        if (data) {
            params.push(data);
            query += ` AND f.data_falta = $2`;
        }

        query += ' ORDER BY f.data_falta DESC, a.nome';

        const res = await this.db.query(query, params);
        return res.rows.map(row => ({
            id: row.id_faltas,
            idAluno: row.id_aluno,
            data: row.data_falta,
            periodo: row.periodo,
            aluno: {
                id: row.id_aluno,
                nome: row.aluno_nome
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getEstatisticas(filters = {}) {
        let query = `
            SELECT 
                COUNT(*) as total_faltas,
                COUNT(DISTINCT id_aluno) as total_alunos
            FROM faltas
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.aluno_id) {
            paramCount++;
            query += ` AND id_aluno = $${paramCount}`;
            params.push(filters.aluno_id);
        }

        if (filters.data_inicio) {
            paramCount++;
            query += ` AND data_falta >= $${paramCount}`;
            params.push(filters.data_inicio);
        }

        if (filters.data_fim) {
            paramCount++;
            query += ` AND data_falta <= $${paramCount}`;
            params.push(filters.data_fim);
        }

        const result = await this.db.query(query, params);
        const estatisticas = result.rows[0];

        return {
            totalFaltas: parseInt(estatisticas.total_faltas),
            totalAlunos: parseInt(estatisticas.total_alunos)
        };
    }
}