import { NovoHorario, Horario } from '../entities/horario.js';

export class HorarioRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
        let query = `
            SELECT h.*, 
                   t.nome as turma_nome,
                   p.id_usuario,
                   u.nome as professor_nome,
                   d.nome as disciplina_nome
            FROM horarios h
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

        query += ' ORDER BY h.dia_semana, h.periodo';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Horario.fromObj({
            id: row.id_horarios,
            idTurma: row.id_turma,
            idProfessor: row.id_professor,
            idDisciplina: row.id_disciplina,
            diaSemana: row.dia_semana,
            periodo: row.periodo,
            sala: row.sala,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            turma: {
                id: row.id_turma,
                nome: row.turma_nome
            },
            professor: {
                id: row.id_professor,
                usuario: {
                    nome: row.professor_nome
                }
            },
            disciplina: {
                id: row.id_disciplina,
                nome: row.disciplina_nome
            }
        }));
    }

    async getById(id) {
        const res = await this.db.query(
            `SELECT h.*, 
                    t.nome as turma_nome,
                    p.id_usuario,
                    u.nome as professor_nome,
                    d.nome as disciplina_nome
             FROM horarios h
             LEFT JOIN turmas t ON h.id_turma = t.id_turmas
             LEFT JOIN professores p ON h.id_professor = p.id_professores
             LEFT JOIN usuarios u ON p.id_usuario = u.id_usuarios
             LEFT JOIN disciplinas d ON h.id_disciplina = d.id_disciplinas
             WHERE h.id_horarios = $1`,
            [id]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return Horario.fromObj({
            id: row.id_horarios,
            idTurma: row.id_turma,
            idProfessor: row.id_professor,
            idDisciplina: row.id_disciplina,
            diaSemana: row.dia_semana,
            periodo: row.periodo,
            sala: row.sala,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            turma: {
                id: row.id_turma,
                nome: row.turma_nome
            },
            professor: {
                id: row.id_professor,
                usuario: {
                    nome: row.professor_nome
                }
            },
            disciplina: {
                id: row.id_disciplina,
                nome: row.disciplina_nome
            }
        });
    }

    async create(novoHorario) {
        const res = await this.db.query(
            `INSERT INTO horarios (
                id_turma, id_professor, id_disciplina, dia_semana, periodo, sala
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                novoHorario.idTurma,
                novoHorario.idProfessor,
                novoHorario.idDisciplina,
                novoHorario.diaSemana,
                novoHorario.periodo,
                novoHorario.sala
            ]
        );

        const row = res.rows[0];
        return Horario.fromObj({
            id: row.id_horarios,
            idTurma: row.id_turma,
            idProfessor: row.id_professor,
            idDisciplina: row.id_disciplina,
            diaSemana: row.dia_semana,
            periodo: row.periodo,
            sala: row.sala,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE horarios SET 
                id_professor = $1,
                id_disciplina = $2,
                dia_semana = $3,
                periodo = $4,
                sala = $5,
                updated_at = NOW()
            WHERE id_horarios = $6 RETURNING *`,
            [
                updateData.idProfessor,
                updateData.idDisciplina,
                updateData.diaSemana,
                updateData.periodo,
                updateData.sala,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Horário não encontrado");

        const row = res.rows[0];
        return Horario.fromObj({
            id: row.id_horarios,
            idTurma: row.id_turma,
            idProfessor: row.id_professor,
            idDisciplina: row.id_disciplina,
            diaSemana: row.dia_semana,
            periodo: row.periodo,
            sala: row.sala,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async delete(id) {
        const res = await this.db.query("DELETE FROM horarios WHERE id_horarios = $1", [id]);
        if (res.rowCount === 0) throw new Error("Horário não encontrado");
    }

    async hasConflito(horarioData) {
        const { idProfessor, diaSemana, periodo, id } = horarioData;
        
        let query = 'SELECT 1 FROM horarios WHERE id_professor = $1 AND dia_semana = $2 AND periodo = $3';
        const params = [idProfessor, diaSemana, periodo];

        if (id) {
            params.push(id);
            query += ` AND id_horarios != $4`;
        }

        query += ' LIMIT 1';

        const res = await this.db.query(query, params);
        return res.rows.length > 0;
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
}