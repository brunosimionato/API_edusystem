import { Router } from 'express';
import { createAuthMiddleware } from './auth.middleware.js';

export class HorarioController {
    constructor(db) {
        this.db = db;
    }

    // Mapeamento de números para dias da semana
    getDiaSemanaTexto(numero) {
        const dias = {
            1: 'segunda',
            2: 'terca',
            3: 'quarta',
            4: 'quinta',
            5: 'sexta'
        };
        return dias[numero] || 'segunda';
    }

    // Mapeamento de período para horários
    getPeriodoHorarios(periodo, turno = 'manha') {
        const horariosManha = {
            1: { inicio: '07:30:00', fim: '08:15:00' },
            2: { inicio: '08:15:00', fim: '09:00:00' },
            3: { inicio: '09:00:00', fim: '09:45:00' },
            4: { inicio: '10:00:00', fim: '10:45:00' },
            5: { inicio: '10:45:00', fim: '11:30:00' }
        };

        const horariosTarde = {
            1: { inicio: '13:00:00', fim: '13:45:00' },
            2: { inicio: '13:45:00', fim: '14:30:00' },
            3: { inicio: '14:30:00', fim: '15:15:00' },
            4: { inicio: '15:30:00', fim: '16:15:00' },
            5: { inicio: '16:15:00', fim: '17:00:00' }
        };

        const horarios = turno === 'tarde' ? horariosTarde : horariosManha;
        return horarios[periodo] || horarios[1];
    }

    async list(req, res) {
        try {
            const { idTurma, idProfessor, idDisciplina } = req.query;

            let query = `
                SELECT 
                    h.id_horarios_aulas as id,
                    h.id_turma as "idTurma",
                    h.id_disciplina as "idDisciplina",
                    h.id_professor as "idProfessor",
                    h.dia_semana as "diaSemana",
                    h.horario_inicio as "horaInicio",
                    h.horario_fim as "horaFim",
                    h.created_at as "createdAt",
                    h.updated_at as "updatedAt",
                    d.nome as disciplina_nome,
                    d.id_disciplinas as disciplina_id,
                    u.nome as usuario_nome,
                    u.id_usuarios as usuario_id,
                    t.nome as turma_nome,
                    t.id_turmas as turma_id
                FROM horarios_aulas h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                LEFT JOIN usuarios u ON p.id_usuario = u.id_usuarios
                LEFT JOIN turmas t ON h.id_turma = t.id_turmas
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 0;

            if (idTurma) {
                paramCount++;
                query += ` AND h.id_turma = $${paramCount}`;
                params.push(idTurma);
            }

            if (idProfessor) {
                paramCount++;
                query += ` AND h.id_professor = $${paramCount}`;
                params.push(idProfessor);
            }

            if (idDisciplina) {
                paramCount++;
                query += ` AND h.id_disciplina = $${paramCount}`;
                params.push(idDisciplina);
            }

            query += ` ORDER BY 
                CASE h.dia_semana 
                    WHEN 'segunda' THEN 1
                    WHEN 'terca' THEN 2
                    WHEN 'quarta' THEN 3
                    WHEN 'quinta' THEN 4
                    WHEN 'sexta' THEN 5
                END, 
                h.horario_inicio`;

            const result = await this.db.query(query, params);

            const horarios = result.rows.map(row => ({
                id: row.id,
                idTurma: row.idTurma,
                idDisciplina: row.idDisciplina,
                idProfessor: row.idProfessor,
                diaSemana: this.getNumeroDiaSemana(row.diaSemana),
                periodo: this.getPeriodoFromHorario(row.horaInicio),
                sala: 'Sala padrão',
                turma: {
                    id: row.turma_id,
                    nome: row.turma_nome
                },
                disciplina: {
                    id: row.disciplina_id,
                    nome: row.disciplina_nome
                },
                professor: {
                    id: row.idProfessor,
                    usuario: {
                        nome: row.usuario_nome,
                        id: row.usuario_id
                    }
                },
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            }));

            res.json(horarios);
        } catch (error) {
            console.error('Erro ao listar horários:', error);
            res.status(500).json({ error: error.message });
        }
    }

    getNumeroDiaSemana(diaTexto) {
        const dias = {
            'segunda': 1,
            'terca': 2,
            'quarta': 3,
            'quinta': 4,
            'sexta': 5
        };
        return dias[diaTexto] || 1;
    }

    getPeriodoFromHorario(horaInicio) {
        if (!horaInicio) return 1;
        
        const hora = horaInicio.toString();
        if (hora.startsWith('07:30')) return 1;
        if (hora.startsWith('08:15')) return 2;
        if (hora.startsWith('09:00')) return 3;
        if (hora.startsWith('10:00')) return 4;
        if (hora.startsWith('10:45')) return 5;
        if (hora.startsWith('13:00')) return 1;
        if (hora.startsWith('13:45')) return 2;
        if (hora.startsWith('14:30')) return 3;
        if (hora.startsWith('15:30')) return 4;
        if (hora.startsWith('16:15')) return 5;
        
        return 1;
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                `SELECT 
                    h.id_horarios_aulas as id,
                    h.id_turma as "idTurma",
                    h.id_disciplina as "idDisciplina",
                    h.id_professor as "idProfessor",
                    h.dia_semana as "diaSemana",
                    h.horario_inicio as "horaInicio",
                    h.horario_fim as "horaFim",
                    d.nome as disciplina_nome,
                    d.id_disciplinas as disciplina_id,
                    u.nome as usuario_nome,
                    u.id_usuarios as usuario_id
                FROM horarios_aulas h
                LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
                LEFT JOIN professores p ON h.id_professor = p.id_professores
                LEFT JOIN usuarios u ON p.id_usuario = u.id_usuarios
                WHERE h.id_horarios_aulas = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Horário não encontrado' });
            }

            const row = result.rows[0];
            const horario = {
                id: row.id,
                idTurma: row.idTurma,
                idDisciplina: row.idDisciplina,
                idProfessor: row.idProfessor,
                diaSemana: this.getNumeroDiaSemana(row.diaSemana),
                periodo: this.getPeriodoFromHorario(row.horaInicio),
                sala: 'Sala padrão',
                disciplina: {
                    id: row.disciplina_id,
                    nome: row.disciplina_nome
                },
                professor: {
                    id: row.idProfessor,
                    usuario: {
                        nome: row.usuario_nome,
                        id: row.usuario_id
                    }
                }
            };

            res.json(horario);
        } catch (error) {
            console.error('Erro ao obter horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { idTurma, idProfessor, idDisciplina, diaSemana, periodo, sala } = req.body;

            // Validações
            if (!idTurma || !idProfessor || !idDisciplina || !diaSemana || !periodo) {
                return res.status(400).json({ 
                    error: 'idTurma, idProfessor, idDisciplina, diaSemana e periodo são obrigatórios' 
                });
            }

            // Buscar turno da turma para determinar horários corretos
            const turmaResult = await this.db.query(
                'SELECT turno FROM turmas WHERE id_turmas = $1',
                [idTurma]
            );

            const turno = turmaResult.rows[0]?.turno || 'manha';
            
            // Converter número do dia para texto
            const diaSemanaTexto = this.getDiaSemanaTexto(diaSemana);
            
            // Obter horários baseado no período e turno
            const horarios = this.getPeriodoHorarios(periodo, turno.toLowerCase());

            const result = await this.db.query(
                `INSERT INTO horarios_aulas (
                    id_turma, 
                    id_disciplina,
                    id_professor, 
                    dia_semana, 
                    horario_inicio, 
                    horario_fim
                ) VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING 
                    id_horarios_aulas as id,
                    id_turma as "idTurma",
                    id_disciplina as "idDisciplina",
                    id_professor as "idProfessor",
                    dia_semana as "diaSemana",
                    horario_inicio as "horaInicio",
                    horario_fim as "horaFim",
                    created_at as "createdAt",
                    updated_at as "updatedAt"`,
                [idTurma, idDisciplina, idProfessor, diaSemanaTexto, horarios.inicio, horarios.fim]
            );

            const novoHorario = result.rows[0];
            
            // Buscar dados relacionados
            const detalhesResult = await this.db.query(
                `SELECT 
                    d.nome as disciplina_nome,
                    d.id_disciplinas as disciplina_id,
                    u.nome as usuario_nome,
                    u.id_usuarios as usuario_id,
                    t.nome as turma_nome,
                    t.id_turmas as turma_id
                FROM disciplinas d, professores p, usuarios u, turmas t
                WHERE d.id_disciplinas = $1
                AND p.id_professores = $2
                AND p.id_usuario = u.id_usuarios
                AND t.id_turmas = $3`,
                [idDisciplina, idProfessor, idTurma]
            );

            const detalhes = detalhesResult.rows[0] || {};

            res.status(201).json({
                id: novoHorario.id,
                idTurma: novoHorario.idTurma,
                idDisciplina: novoHorario.idDisciplina,
                idProfessor: novoHorario.idProfessor,
                diaSemana: diaSemana,
                periodo: periodo,
                sala: sala || 'Sala padrão',
                turma: {
                    id: detalhes.turma_id,
                    nome: detalhes.turma_nome
                },
                disciplina: {
                    id: detalhes.disciplina_id,
                    nome: detalhes.disciplina_nome
                },
                professor: {
                    id: idProfessor,
                    usuario: {
                        nome: detalhes.usuario_nome,
                        id: detalhes.usuario_id
                    }
                },
                createdAt: novoHorario.createdAt,
                updatedAt: novoHorario.updatedAt
            });
        } catch (error) {
            console.error('Erro ao criar horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { idDisciplina, idProfessor, diaSemana, periodo } = req.body;

            // Buscar horário existente para pegar a turma
            const horarioExistente = await this.db.query(
                'SELECT id_turma FROM horarios_aulas WHERE id_horarios_aulas = $1',
                [id]
            );

            if (horarioExistente.rows.length === 0) {
                return res.status(404).json({ error: 'Horário não encontrado' });
            }

            const idTurma = horarioExistente.rows[0].id_turma;

            // Buscar turno da turma
            const turmaResult = await this.db.query(
                'SELECT turno FROM turmas WHERE id_turmas = $1',
                [idTurma]
            );

            const turno = turmaResult.rows[0]?.turno || 'manha';

            let updateFields = [];
            let params = [];
            let paramCount = 0;

            if (idDisciplina) {
                paramCount++;
                updateFields.push(`id_disciplina = $${paramCount}`);
                params.push(idDisciplina);
            }

            if (idProfessor) {
                paramCount++;
                updateFields.push(`id_professor = $${paramCount}`);
                params.push(idProfessor);
            }

            if (diaSemana) {
                paramCount++;
                const diaSemanaTexto = this.getDiaSemanaTexto(diaSemana);
                updateFields.push(`dia_semana = $${paramCount}`);
                params.push(diaSemanaTexto);
            }

            if (periodo) {
                const horarios = this.getPeriodoHorarios(periodo, turno.toLowerCase());
                paramCount++;
                updateFields.push(`horario_inicio = $${paramCount}`);
                params.push(horarios.inicio);
                
                paramCount++;
                updateFields.push(`horario_fim = $${paramCount}`);
                params.push(horarios.fim);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            updateFields.push('updated_at = NOW()');
            paramCount++;
            params.push(id);

            const query = `
                UPDATE horarios_aulas 
                SET ${updateFields.join(', ')}
                WHERE id_horarios_aulas = $${paramCount}
                RETURNING 
                    id_horarios_aulas as id,
                    id_turma as "idTurma",
                    id_disciplina as "idDisciplina",
                    id_professor as "idProfessor",
                    dia_semana as "diaSemana",
                    horario_inicio as "horaInicio",
                    horario_fim as "horaFim"
            `;

            const result = await this.db.query(query, params);
            const horarioAtualizado = result.rows[0];

            res.json({
                id: horarioAtualizado.id,
                idTurma: horarioAtualizado.idTurma,
                idDisciplina: horarioAtualizado.idDisciplina,
                idProfessor: horarioAtualizado.idProfessor,
                diaSemana: this.getNumeroDiaSemana(horarioAtualizado.diaSemana),
                periodo: this.getPeriodoFromHorario(horarioAtualizado.horaInicio),
                sala: 'Sala padrão'
            });
        } catch (error) {
            console.error('Erro ao atualizar horário:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await this.db.query(
                'DELETE FROM horarios_aulas WHERE id_horarios_aulas = $1 RETURNING *',
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
}

export function createHorarioRouter(db, hashingService) {
    const horarioController = new HorarioController(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', (req, res) => horarioController.list(req, res));
    router.get('/:id', (req, res) => horarioController.getById(req, res));
    router.post('/', (req, res) => horarioController.create(req, res));
    router.put('/:id', (req, res) => horarioController.update(req, res));
    router.delete('/:id', (req, res) => horarioController.delete(req, res));

    return router;
}