import { NovaNota, Nota } from '../entities/nota.js';

export class NotaRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
        let query = 'SELECT * FROM notas WHERE 1=1';
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

        if (filters.anoLetivo) {
            paramCount++;
            query += ` AND ano_letivo = $${paramCount}`;
            params.push(filters.anoLetivo);
        }

        if (filters.trimestre) {
            paramCount++;
            query += ` AND trimestre = $${paramCount}`;
            params.push(filters.trimestre);
        }

        query += ' ORDER BY id_aluno, id_disciplina';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getById(id) {
        const res = await this.db.query('SELECT * FROM notas WHERE id_notas = $1', [id]);
        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async create(novaNota) {
        const res = await this.db.query(
            `INSERT INTO notas (
                id_aluno, id_disciplina, id_turma, trimestre, nota, ano_letivo, tipo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                novaNota.idAluno,
                novaNota.idDisciplina,
                novaNota.idTurma,
                novaNota.trimestre,
                novaNota.nota,
                novaNota.anoLetivo,
                novaNota.tipo
            ]
        );

        const row = res.rows[0];
        return Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE notas SET 
                id_disciplina = $1,
                trimestre = $2,
                nota = $3,
                tipo = $4,
                updated_at = NOW()
            WHERE id_notas = $5 RETURNING *`,
            [
                updateData.idDisciplina,
                updateData.trimestre,
                updateData.nota,
                updateData.tipo,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Nota não encontrada");

        const row = res.rows[0];
        return Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async delete(id) {
        const res = await this.db.query("DELETE FROM notas WHERE id_notas = $1", [id]);
        if (res.rowCount === 0) throw new Error("Nota não encontrada");
    }

    async getByAlunoId(alunoId, anoLetivo, trimestre) {
        let query = 'SELECT * FROM notas WHERE id_aluno = $1';
        const params = [alunoId];

        if (anoLetivo) {
            params.push(anoLetivo);
            query += ` AND ano_letivo = $${params.length}`;
        }

        if (trimestre) {
            params.push(trimestre);
            query += ` AND trimestre = $${params.length}`;
        }

        query += ' ORDER BY id_disciplina';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getByTurmaId(turmaId, anoLetivo, trimestre) {
        let query = 'SELECT * FROM notas WHERE id_turma = $1';
        const params = [turmaId];

        if (anoLetivo) {
            params.push(anoLetivo);
            query += ` AND ano_letivo = $${params.length}`;
        }

        if (trimestre) {
            params.push(trimestre);
            query += ` AND trimestre = $${params.length}`;
        }

        query += ' ORDER BY id_aluno, id_disciplina';

        const res = await this.db.query(query, params);
        return res.rows.map(row => Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }
}