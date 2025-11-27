import { Router } from 'express';
import { createAuthMiddleware } from './auth.middleware.js';

export class FaltaController {
    /**
     * @param {import('../db/index.js').PoolClient} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Lista todas as faltas
     */
    async list(req, res) {
        try {
            const { aluno_id, data_inicio, data_fim, page = 1, limit = 10 } = req.query;

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

            if (aluno_id) {
                paramCount++;
                query += ` AND f.id_aluno = $${paramCount}`;
                params.push(aluno_id);
            }

            if (data_inicio) {
                paramCount++;
                query += ` AND f.data_falta >= $${paramCount}`;
                params.push(data_inicio);
            }

            if (data_fim) {
                paramCount++;
                query += ` AND f.data_falta <= $${paramCount}`;
                params.push(data_fim);
            }

            query += ` ORDER BY f.data_falta DESC, f.created_at DESC`;

            // Paginação
            const offset = (parseInt(page) - 1) * parseInt(limit);
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(parseInt(limit));

            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(offset);

            const result = await this.db.query(query, params);

            const faltas = result.rows.map(row => ({
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

            res.json(faltas);
        } catch (error) {
            console.error('Erro ao listar faltas:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém uma falta específica por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                `SELECT 
                    f.*,
                    a.nome as aluno_nome
                FROM faltas f
                LEFT JOIN alunos a ON f.id_aluno = a.id_alunos
                WHERE f.id_faltas = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Falta não encontrada' });
            }

            const row = result.rows[0];
            const falta = {
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

            res.json(falta);
        } catch (error) {
            console.error('Erro ao obter falta:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Registra uma nova falta
     */
    async create(req, res) {
        try {
            const { idAluno, data, periodo } = req.body;

            if (!idAluno || !data) {
                return res.status(400).json({ 
                    error: 'idAluno e data são obrigatórios' 
                });
            }

            // Verifica se o aluno existe
            const alunoResult = await this.db.query(
                'SELECT id_alunos FROM alunos WHERE id_alunos = $1',
                [idAluno]
            );
            if (alunoResult.rows.length === 0) {
                return res.status(404).json({ error: 'Aluno não encontrado' });
            }

            const result = await this.db.query(
                `INSERT INTO faltas (
                    id_aluno, 
                    data_falta,
                    periodo
                ) VALUES ($1, $2, $3) 
                RETURNING *`,
                [idAluno, data, periodo || null]
            );

            const novaFalta = result.rows[0];
            res.status(201).json({
                id: novaFalta.id_faltas,
                idAluno: novaFalta.id_aluno,
                data: novaFalta.data_falta,
                periodo: novaFalta.periodo,
                createdAt: novaFalta.created_at,
                updatedAt: novaFalta.updated_at
            });
        } catch (error) {
            console.error('Erro ao criar falta:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Atualiza uma falta existente
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { data, periodo } = req.body;

            const result = await this.db.query(
                `UPDATE faltas SET 
                    data_falta = COALESCE($1, data_falta),
                    periodo = COALESCE($2, periodo),
                    updated_at = NOW()
                WHERE id_faltas = $3
                RETURNING *`,
                [data, periodo, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Falta não encontrada' });
            }

            const faltaAtualizada = result.rows[0];
            res.json({
                id: faltaAtualizada.id_faltas,
                idAluno: faltaAtualizada.id_aluno,
                data: faltaAtualizada.data_falta,
                periodo: faltaAtualizada.periodo,
                createdAt: faltaAtualizada.created_at,
                updatedAt: faltaAtualizada.updated_at
            });
        } catch (error) {
            console.error('Erro ao atualizar falta:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Remove uma falta
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                'DELETE FROM faltas WHERE id_faltas = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Falta não encontrada' });
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar falta:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém faltas por aluno
     */
    async getByAluno(req, res) {
        try {
            const { alunoId } = req.params;
            const { data_inicio, data_fim } = req.query;

            let query = `
                SELECT 
                    f.*
                FROM faltas f
                WHERE f.id_aluno = $1
            `;
            const params = [alunoId];
            let paramCount = 1;

            if (data_inicio) {
                paramCount++;
                query += ` AND f.data_falta >= $${paramCount}`;
                params.push(data_inicio);
            }

            if (data_fim) {
                paramCount++;
                query += ` AND f.data_falta <= $${paramCount}`;
                params.push(data_fim);
            }

            query += ` ORDER BY f.data_falta DESC`;

            const result = await this.db.query(query, params);

            const faltas = result.rows.map(row => ({
                id: row.id_faltas,
                idAluno: row.id_aluno,
                data: row.data_falta,
                periodo: row.periodo,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            res.json(faltas);
        } catch (error) {
            console.error('Erro ao obter faltas por aluno:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém estatísticas de faltas
     */
    async getEstatisticas(req, res) {
        try {
            const { aluno_id, data_inicio, data_fim } = req.query;

            let query = `
                SELECT 
                    COUNT(*) as total_faltas,
                    COUNT(DISTINCT id_aluno) as total_alunos
                FROM faltas
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 0;

            if (aluno_id) {
                paramCount++;
                query += ` AND id_aluno = $${paramCount}`;
                params.push(aluno_id);
            }

            if (data_inicio) {
                paramCount++;
                query += ` AND data_falta >= $${paramCount}`;
                params.push(data_inicio);
            }

            if (data_fim) {
                paramCount++;
                query += ` AND data_falta <= $${paramCount}`;
                params.push(data_fim);
            }

            const result = await this.db.query(query, params);
            const estatisticas = result.rows[0];

            res.json({
                totalFaltas: parseInt(estatisticas.total_faltas),
                totalAlunos: parseInt(estatisticas.total_alunos)
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

/**
 * Cria e retorna um router de faltas
 */
export function createFaltaRouter(db, hashingService) {
    const faltaController = new FaltaController(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', (req, res) => faltaController.list(req, res));
    router.get('/estatisticas', (req, res) => faltaController.getEstatisticas(req, res));
    router.get('/aluno/:alunoId', (req, res) => faltaController.getByAluno(req, res));
    router.get('/:id', (req, res) => faltaController.getById(req, res));
    router.post('/', (req, res) => faltaController.create(req, res));
    router.put('/:id', (req, res) => faltaController.update(req, res));
    router.delete('/:id', (req, res) => faltaController.delete(req, res));

    return router;
}