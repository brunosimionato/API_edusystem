import { NovaNota, Nota } from '../entities/nota.js';

export class NotaRepository {
    constructor(db) {
        this.db = db;
    }

    async list(filters = {}) {
        let query = `
            SELECT n.*, a.nome as aluno_nome, d.nome as disciplina_nome, t.nome as turma_nome 
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            JOIN turmas t ON n.id_turma = t.id_turmas
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (filters.idAluno) {
            paramCount++;
            query += ` AND n.id_aluno = $${paramCount}`;
            params.push(filters.idAluno);
        }

        if (filters.idTurma) {
            paramCount++;
            query += ` AND n.id_turma = $${paramCount}`;
            params.push(filters.idTurma);
        }

        if (filters.idDisciplina) {
            paramCount++;
            query += ` AND n.id_disciplina = $${paramCount}`;
            params.push(filters.idDisciplina);
        }

        if (filters.anoLetivo) {
            paramCount++;
            query += ` AND n.ano_letivo = $${paramCount}`;
            params.push(filters.anoLetivo);
        }

        if (filters.trimestre) {
            paramCount++;
            query += ` AND n.trimestre = $${paramCount}`;
            params.push(filters.trimestre);
        }

        query += ' ORDER BY a.nome, d.nome, n.ano_letivo DESC, n.trimestre';

        const res = await this.db.query(query, params);
        return res.rows.map(row => this.mapRowToNota(row));
    }

    async getById(id) {
        const res = await this.db.query(`
            SELECT n.*, a.nome as aluno_nome, d.nome as disciplina_nome, t.nome as turma_nome 
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            JOIN turmas t ON n.id_turma = t.id_turmas
            WHERE n.id_notas = $1
        `, [id]);
        
        if (res.rows.length === 0) return null;

        return this.mapRowToNota(res.rows[0]);
    }

    async create(novaNota) {
        const res = await this.db.query(
            `INSERT INTO notas (
                id_aluno, id_disciplina, id_turma, trimestre, nota, ano_letivo
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                novaNota.idAluno,
                novaNota.idDisciplina,
                novaNota.idTurma,
                novaNota.trimestre,
                novaNota.nota,
                novaNota.anoLetivo
            ]
        );

        return this.mapRowToNota(res.rows[0]);
    }

    async update(id, updateData) {
        // Construir query dinâmica para update
        const fields = [];
        const values = [];
        let paramCount = 1;

        const fieldMappings = {
            idAluno: 'id_aluno',
            idDisciplina: 'id_disciplina',
            idTurma: 'id_turma',
            trimestre: 'trimestre',
            nota: 'nota',
            anoLetivo: 'ano_letivo'
        };

        for (const [key, dbField] of Object.entries(fieldMappings)) {
            if (updateData[key] !== undefined) {
                fields.push(`${dbField} = $${paramCount}`);
                values.push(updateData[key]);
                paramCount++;
            }
        }

        if (fields.length === 0) {
            throw new Error('Nenhum campo para atualizar');
        }

        fields.push('updated_at = NOW()');
        values.push(id);

        const query = `
            UPDATE notas 
            SET ${fields.join(', ')}
            WHERE id_notas = $${paramCount}
            RETURNING *
        `;

        const res = await this.db.query(query, values);
        
        if (res.rows.length === 0) {
            throw new Error("Nota não encontrada");
        }

        return this.mapRowToNota(res.rows[0]);
    }

    async delete(id) {
        const res = await this.db.query("DELETE FROM notas WHERE id_notas = $1", [id]);
        if (res.rowCount === 0) throw new Error("Nota não encontrada");
    }

    async getByAlunoId(alunoId, anoLetivo, trimestre) {
        let query = `
            SELECT n.*, a.nome as aluno_nome, d.nome as disciplina_nome, t.nome as turma_nome 
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            JOIN turmas t ON n.id_turma = t.id_turmas
            WHERE n.id_aluno = $1
        `;
        const params = [alunoId];

        if (anoLetivo) {
            params.push(anoLetivo);
            query += ` AND n.ano_letivo = $${params.length}`;
        }

        if (trimestre) {
            params.push(trimestre);
            query += ` AND n.trimestre = $${params.length}`;
        }

        query += ' ORDER BY d.nome, n.trimestre';

        const res = await this.db.query(query, params);
        return res.rows.map(row => this.mapRowToNota(row));
    }

    async getByTurmaId(turmaId, anoLetivo, trimestre) {
        let query = `
            SELECT n.*, a.nome as aluno_nome, d.nome as disciplina_nome, t.nome as turma_nome 
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            JOIN turmas t ON n.id_turma = t.id_turmas
            WHERE n.id_turma = $1
        `;
        const params = [turmaId];

        if (anoLetivo) {
            params.push(anoLetivo);
            query += ` AND n.ano_letivo = $${params.length}`;
        }

        if (trimestre) {
            params.push(trimestre);
            query += ` AND n.trimestre = $${params.length}`;
        }

        query += ' ORDER BY a.nome, d.nome, n.trimestre';

        const res = await this.db.query(query, params);
        return res.rows.map(row => this.mapRowToNota(row));
    }

    async verificarNotaExistente(notaData) {
        const query = `
            SELECT id_notas FROM notas 
            WHERE id_aluno = $1 
            AND id_disciplina = $2 
            AND id_turma = $3 
            AND ano_letivo = $4 
            AND trimestre = $5
        `;
        
        const result = await this.db.query(query, [
            notaData.idAluno,
            notaData.idDisciplina,
            notaData.idTurma,
            notaData.anoLetivo,
            notaData.trimestre
        ]);

        return result.rows.length > 0;
    }

    async verificarAlunoNaTurma(idAluno, idTurma) {
        const query = `
            SELECT 1 FROM alunos_turmas 
            WHERE id_aluno = $1 AND id_turma = $2
        `;
        
        const result = await this.db.query(query, [idAluno, idTurma]);
        return result.rows.length > 0;
    }

    mapRowToNota(row) {
        return Nota.fromObj({
            id: row.id_notas,
            idAluno: row.id_aluno,
            alunoNome: row.aluno_nome,
            idDisciplina: row.id_disciplina,
            disciplinaNome: row.disciplina_nome,
            idTurma: row.id_turma,
            turmaNome: row.turma_nome,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            tipo: row.tipo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }
}