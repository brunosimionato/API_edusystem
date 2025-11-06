// src/services/nota.service.js - NOVO
import { NovaNota, Nota } from '../entities/nota.js';

export class NotaService {
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

        const res = await this.db.query(query, params);
        return res.rows.map(row => new Nota({
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
        return new Nota({
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

    async create(novaNotaData) {
        const novaNota = new NovaNota(novaNotaData);
        
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
        return new Nota({
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
        // Implementação similar ao create
    }

    async delete(id) {
        const res = await this.db.query('DELETE FROM notas WHERE id_notas = $1', [id]);
        if (res.rowCount === 0) throw new Error('Nota não encontrada');
    }
}