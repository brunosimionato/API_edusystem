import { Router } from 'express';
import { createAuthMiddleware } from './auth.middleware.js';

export class HorarioController {
    /**
     * @param {import('../db/index.js').PoolClient} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Lista todos os horários
     */
    async list(req, res) {
        try {
            const { disciplina_id, dia_semana, professor } = req.query;

            let query = `
                SELECT 
                    h.*,
                    d.nome as disciplina_nome,
                    p.nome as professor_nome
                FROM horarios h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 0;

            if (disciplina_id) {
                paramCount++;
                query += ` AND h.id_disciplina = $${paramCount}`;
                params.push(disciplina_id);
            }

            if (dia_semana) {
                paramCount++;
                query += ` AND h.dia_semana = $${paramCount}`;
                params.push(dia_semana);
            }

            if (professor) {
                paramCount++;
                query += ` AND p.nome ILIKE $${paramCount}`;
                params.push(`%${professor}%`);
            }

            query += ` ORDER BY 
                CASE h.dia_semana 
                    WHEN 'segunda' THEN 1
                    WHEN 'terca' THEN 2
                    WHEN 'quarta' THEN 3
                    WHEN 'quinta' THEN 4
                    WHEN 'sexta' THEN 5
                    WHEN 'sabado' THEN 6
                    WHEN 'domingo' THEN 7
                END, 
                h.hora_inicio`;

            const result = await this.db.query(query, params);

            const horarios = result.rows.map(row => ({
                id: row.id_horarios,
                idDisciplina: row.id_disciplina,
                idProfessor: row.id_professor,
                diaSemana: row.dia_semana,
                horaInicio: row.hora_inicio,
                horaFim: row.hora_fim,
                sala: row.sala,
                disciplina: {
                    id: row.id_disciplina,
                    nome: row.disciplina_nome
                },
                professor: {
                    id: row.id_professor,
                    nome: row.professor_nome
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            res.json(horarios);
        } catch (error) {
            console.error('Erro ao listar horários:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém um horário específico por ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                `SELECT 
                    h.*,
                    d.nome as disciplina_nome,
                    p.nome as professor_nome
                FROM horarios h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                WHERE h.id_horarios = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Horário não encontrado' });
            }

            const row = result.rows[0];
            const horario = {
                id: row.id_horarios,
                idDisciplina: row.id_disciplina,
                idProfessor: row.id_professor,
                diaSemana: row.dia_semana,
                horaInicio: row.hora_inicio,
                horaFim: row.hora_fim,
                sala: row.sala,
                disciplina: {
                    id: row.id_disciplina,
                    nome: row.disciplina_nome
                },
                professor: {
                    id: row.id_professor,
                    nome: row.professor_nome
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };

            res.json(horario);
        } catch (error) {
            console.error('Erro ao obter horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Cria um novo horário
     */
    async create(req, res) {
        try {
            const { idDisciplina, idProfessor, diaSemana, horaInicio, horaFim, sala } = req.body;

            // Validações
            if (!idDisciplina || !idProfessor || !diaSemana || !horaInicio || !horaFim) {
                return res.status(400).json({ 
                    error: 'idDisciplina, idProfessor, diaSemana, horaInicio e horaFim são obrigatórios' 
                });
            }

            // Valida formato do horário
            const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFim)) {
                return res.status(400).json({ 
                    error: 'Formato de horário inválido. Use HH:MM' 
                });
            }

            // Valida dia da semana
            const diasValidos = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
            if (!diasValidos.includes(diaSemana.toLowerCase())) {
                return res.status(400).json({ 
                    error: 'Dia da semana inválido. Use: segunda, terca, quarta, quinta, sexta, sabado, domingo' 
                });
            }

            // Verifica conflito de horário
            const conflitoResult = await this.db.query(
                `SELECT * FROM horarios 
                WHERE dia_semana = $1 
                AND id_professor = $2
                AND (
                    (hora_inicio <= $3 AND hora_fim > $3) OR
                    (hora_inicio < $4 AND hora_fim >= $4) OR
                    (hora_inicio >= $3 AND hora_fim <= $4)
                )`,
                [diaSemana, idProfessor, horaInicio, horaFim]
            );

            if (conflitoResult.rows.length > 0) {
                return res.status(409).json({ 
                    error: 'Conflito de horário para este professor' 
                });
            }

            const result = await this.db.query(
                `INSERT INTO horarios (
                    id_disciplina, 
                    id_professor, 
                    dia_semana, 
                    hora_inicio, 
                    hora_fim, 
                    sala
                ) VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [idDisciplina, idProfessor, diaSemana, horaInicio, horaFim, sala]
            );

            const novoHorario = result.rows[0];
            res.status(201).json({
                id: novoHorario.id_horarios,
                idDisciplina: novoHorario.id_disciplina,
                idProfessor: novoHorario.id_professor,
                diaSemana: novoHorario.dia_semana,
                horaInicio: novoHorario.hora_inicio,
                horaFim: novoHorario.hora_fim,
                sala: novoHorario.sala,
                createdAt: novoHorario.created_at,
                updatedAt: novoHorario.updated_at
            });
        } catch (error) {
            console.error('Erro ao criar horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Atualiza um horário existente
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { diaSemana, horaInicio, horaFim, sala } = req.body;

            const result = await this.db.query(
                `UPDATE horarios SET 
                    dia_semana = COALESCE($1, dia_semana),
                    hora_inicio = COALESCE($2, hora_inicio),
                    hora_fim = COALESCE($3, hora_fim),
                    sala = COALESCE($4, sala),
                    updated_at = NOW()
                WHERE id_horarios = $5
                RETURNING *`,
                [diaSemana, horaInicio, horaFim, sala, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Horário não encontrado' });
            }

            const horarioAtualizado = result.rows[0];
            res.json({
                id: horarioAtualizado.id_horarios,
                idDisciplina: horarioAtualizado.id_disciplina,
                idProfessor: horarioAtualizado.id_professor,
                diaSemana: horarioAtualizado.dia_semana,
                horaInicio: horarioAtualizado.hora_inicio,
                horaFim: horarioAtualizado.hora_fim,
                sala: horarioAtualizado.sala,
                createdAt: horarioAtualizado.created_at,
                updatedAt: horarioAtualizado.updated_at
            });
        } catch (error) {
            console.error('Erro ao atualizar horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Remove um horário
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                'DELETE FROM horarios WHERE id_horarios = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Horário não encontrado' });
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém horários por disciplina
     */
    async getByDisciplina(req, res) {
        try {
            const { disciplinaId } = req.params;

            const result = await this.db.query(
                `SELECT 
                    h.*,
                    p.nome as professor_nome
                FROM horarios h
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                WHERE h.id_disciplina = $1
                ORDER BY 
                    CASE h.dia_semana 
                        WHEN 'segunda' THEN 1
                        WHEN 'terca' THEN 2
                        WHEN 'quarta' THEN 3
                        WHEN 'quinta' THEN 4
                        WHEN 'sexta' THEN 5
                        WHEN 'sabado' THEN 6
                        WHEN 'domingo' THEN 7
                    END, 
                    h.hora_inicio`,
                [disciplinaId]
            );

            const horarios = result.rows.map(row => ({
                id: row.id_horarios,
                idDisciplina: row.id_disciplina,
                idProfessor: row.id_professor,
                diaSemana: row.dia_semana,
                horaInicio: row.hora_inicio,
                horaFim: row.hora_fim,
                sala: row.sala,
                professor: {
                    id: row.id_professor,
                    nome: row.professor_nome
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            res.json(horarios);
        } catch (error) {
            console.error('Erro ao obter horários por disciplina:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém grade horária por dia
     */
    async getByDia(req, res) {
        try {
            const { dia } = req.params;

            const result = await this.db.query(
                `SELECT 
                    h.*,
                    d.nome as disciplina_nome,
                    p.nome as professor_nome
                FROM horarios h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                WHERE h.dia_semana = $1
                ORDER BY h.hora_inicio`,
                [dia]
            );

            const horarios = result.rows.map(row => ({
                id: row.id_horarios,
                idDisciplina: row.id_disciplina,
                idProfessor: row.id_professor,
                diaSemana: row.dia_semana,
                horaInicio: row.hora_inicio,
                horaFim: row.hora_fim,
                sala: row.sala,
                disciplina: {
                    id: row.id_disciplina,
                    nome: row.disciplina_nome
                },
                professor: {
                    id: row.id_professor,
                    nome: row.professor_nome
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            res.json(horarios);
        } catch (error) {
            console.error('Erro ao obter horários por dia:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtém grade horária completa
     */
    async getGradeCompleta(req, res) {
        try {
            const result = await this.db.query(
                `SELECT 
                    h.*,
                    d.nome as disciplina_nome,
                    p.nome as professor_nome
                FROM horarios h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                ORDER BY 
                    CASE h.dia_semana 
                        WHEN 'segunda' THEN 1
                        WHEN 'terca' THEN 2
                        WHEN 'quarta' THEN 3
                        WHEN 'quinta' THEN 4
                        WHEN 'sexta' THEN 5
                        WHEN 'sabado' THEN 6
                        WHEN 'domingo' THEN 7
                    END, 
                    h.hora_inicio`
            );

            const grade = {
                segunda: [],
                terca: [],
                quarta: [],
                quinta: [],
                sexta: [],
                sabado: [],
                domingo: []
            };

            result.rows.forEach(row => {
                const horario = {
                    id: row.id_horarios,
                    idDisciplina: row.id_disciplina,
                    idProfessor: row.id_professor,
                    diaSemana: row.dia_semana,
                    horaInicio: row.hora_inicio,
                    horaFim: row.hora_fim,
                    sala: row.sala,
                    disciplina: {
                        id: row.id_disciplina,
                        nome: row.disciplina_nome
                    },
                    professor: {
                        id: row.id_professor,
                        nome: row.professor_nome
                    }
                };

                if (grade[row.dia_semana]) {
                    grade[row.dia_semana].push(horario);
                }
            });

            res.json(grade);
        } catch (error) {
            console.error('Erro ao obter grade completa:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

/**
 * Cria e retorna um router de horários
 */
export function createHorarioRouter(db, hashingService) {
    const horarioController = new HorarioController(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', (req, res) => horarioController.list(req, res));
    router.get('/grade-completa', (req, res) => horarioController.getGradeCompleta(req, res));
    router.get('/disciplina/:disciplinaId', (req, res) => horarioController.getByDisciplina(req, res));
    router.get('/dia/:dia', (req, res) => horarioController.getByDia(req, res));
    router.get('/:id', (req, res) => horarioController.getById(req, res));
    router.post('/', (req, res) => horarioController.create(req, res));
    router.put('/:id', (req, res) => horarioController.update(req, res));
    router.delete('/:id', (req, res) => horarioController.delete(req, res));

    return router;
}