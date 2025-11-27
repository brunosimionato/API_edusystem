import { NovoHorario, Horario } from '../entities/horario.js';

export class HorarioRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
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
                t.nome as turma_nome,
                t.id_turmas as turma_id,
                p.nome as professor_nome,
                p.id_professores as professor_id,
                u.nome as usuario_nome,
                d.nome as disciplina_nome,
                d.id_disciplinas as disciplina_id
            FROM horarios_aulas h
            LEFT JOIN turmas t ON h.id_turma = t.id_turmas
            LEFT JOIN professores p ON h.id_professor = p.id_professores
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuarios
            LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.idTurma) {
            paramCount++;
            query += ` AND h.id_turma = $${paramCount}`;
            params.push(filters.idTurma);
        }

        if (filters.idProfessor) {
            paramCount++;
            query += ` AND h.id_professor = $${paramCount}`;
            params.push(filters.idProfessor);
        }

        if (filters.idDisciplina) {
            paramCount++;
            query += ` AND h.id_disciplina = $${paramCount}`;
            params.push(filters.idDisciplina);
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

        const res = await this.db.query(query, params);
        return res.rows.map(row => this.mapRowToHorario(row));
    }

    async getById(id) {
        const res = await this.db.query(
            `SELECT 
                h.id_horarios_aulas as id,
                h.id_turma as "idTurma",
                h.id_disciplina as "idDisciplina",
                h.id_professor as "idProfessor", 
                h.dia_semana as "diaSemana",
                h.horario_inicio as "horaInicio",
                h.horario_fim as "horaFim",
                h.created_at as "createdAt",
                h.updated_at as "updatedAt",
                t.nome as turma_nome,
                t.id_turmas as turma_id,
                p.nome as professor_nome,
                p.id_professores as professor_id,
                u.nome as usuario_nome,
                d.nome as disciplina_nome,
                d.id_disciplinas as disciplina_id
             FROM horarios_aulas h
             LEFT JOIN turmas t ON h.id_turma = t.id_turmas
             LEFT JOIN professores p ON h.id_professor = p.id_professores
             LEFT JOIN usuarios u ON p.id_usuario = u.id_usuarios
             LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
             WHERE h.id_horarios_aulas = $1`,
            [id]
        );

        if (res.rows.length === 0) return null;

        return this.mapRowToHorario(res.rows[0]);
    }

    async create(novoHorario) {
        const diaSemanaTexto = this.getDiaSemanaTexto(novoHorario.diaSemana);
        const horarios = this.getPeriodoHorarios(novoHorario.periodo, 'manha');

        const res = await this.db.query(
            `INSERT INTO horarios_aulas (
                id_turma, id_disciplina, id_professor, dia_semana, horario_inicio, horario_fim
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
            [
                novoHorario.idTurma,
                novoHorario.idDisciplina,
                novoHorario.idProfessor,
                diaSemanaTexto,
                horarios.inicio,
                horarios.fim
            ]
        );

        const row = res.rows[0];
        
        const detalhes = await this.getDetalhesHorario(
            novoHorario.idTurma, 
            novoHorario.idProfessor, 
            novoHorario.idDisciplina
        );

        return this.mapRowToHorario({
            ...row,
            ...detalhes,
            diaSemana: this.getNumeroDiaSemana(row.diaSemana),
            periodo: this.getPeriodoFromHorario(row.horaInicio)
        });
    }

    async update(id, updateData) {
        const horarioExistente = await this.getById(id);
        if (!horarioExistente) {
            throw new Error("Horário não encontrado");
        }

        const diaSemanaTexto = updateData.diaSemana ? 
            this.getDiaSemanaTexto(updateData.diaSemana) : 
            horarioExistente.diaSemanaTexto;

        const horarios = updateData.periodo ? 
            this.getPeriodoHorarios(updateData.periodo, 'manha') : 
            { inicio: horarioExistente.horaInicio, fim: horarioExistente.horaFim };

        const res = await this.db.query(
            `UPDATE horarios_aulas SET 
                id_professor = COALESCE($1, id_professor),
                id_disciplina = COALESCE($2, id_disciplina),
                dia_semana = COALESCE($3, dia_semana),
                horario_inicio = COALESCE($4, horario_inicio),
                horario_fim = COALESCE($5, horario_fim),
                updated_at = NOW()
            WHERE id_horarios_aulas = $6 
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
            [
                updateData.idProfessor || null,
                updateData.idDisciplina || null,
                diaSemanaTexto || null,
                horarios.inicio || null,
                horarios.fim || null,
                id
            ]
        );

        if (res.rows.length === 0) {
            throw new Error("Horário não encontrado");
        }

        const row = res.rows[0];
        
        const detalhes = await this.getDetalhesHorario(
            row.idTurma,
            row.idProfessor, 
            row.idDisciplina
        );

        return this.mapRowToHorario({
            ...row,
            ...detalhes,
            diaSemana: this.getNumeroDiaSemana(row.diaSemana),
            periodo: this.getPeriodoFromHorario(row.horaInicio)
        });
    }

    async delete(id) {
        const res = await this.db.query(
            "DELETE FROM horarios_aulas WHERE id_horarios_aulas = $1", 
            [id]
        );
        if (res.rowCount === 0) {
            throw new Error("Horário não encontrado");
        }
    }

    async getByTurmaId(turmaId) {
        return this.list({ idTurma: turmaId });
    }

    async getByProfessorId(professorId) {
        return this.list({ idProfessor: professorId });
    }

    async getGradeHorarios(turmaId) {
        const horarios = await this.getByTurmaId(turmaId);
        
        const grade = {
            1: {}, // Segunda
            2: {}, // Terça  
            3: {}, // Quarta
            4: {}, // Quinta
            5: {}  // Sexta
        };

        horarios.forEach(horario => {
            if (!grade[horario.diaSemana]) {
                grade[horario.diaSemana] = {};
            }
            grade[horario.diaSemana][horario.periodo] = horario;
        });

        return grade;
    }

    mapRowToHorario(row) {
        return new Horario({
            id: row.id,
            idTurma: row.idTurma,
            idDisciplina: row.idDisciplina,
            idProfessor: row.idProfessor,
            diaSemana: this.getNumeroDiaSemana(row.diaSemana),
            periodo: this.getPeriodoFromHorario(row.horaInicio),
            sala: 'Sala padrão',
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            turma: {
                id: row.turma_id,
                nome: row.turma_nome
            },
            professor: {
                id: row.professor_id,
                usuario: {
                    nome: row.usuario_nome || row.professor_nome
                }
            },
            disciplina: {
                id: row.disciplina_id,
                nome: row.disciplina_nome
            }
        });
    }

    async getDetalhesHorario(idTurma, idProfessor, idDisciplina) {
        const res = await this.db.query(
            `SELECT 
                t.nome as turma_nome,
                t.id_turmas as turma_id,
                p.nome as professor_nome,
                p.id_professores as professor_id,
                u.nome as usuario_nome,
                d.nome as disciplina_nome,
                d.id_disciplinas as disciplina_id
            FROM turmas t, professores p, usuarios u, disciplinas d
            WHERE t.id_turmas = $1
            AND p.id_professores = $2
            AND p.id_usuario = u.id_usuarios
            AND d.id_disciplinas = $3`,
            [idTurma, idProfessor, idDisciplina]
        );

        return res.rows[0] || {};
    }

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
}