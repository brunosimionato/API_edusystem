import { NovaNota, Nota } from '../entities/nota.js';

export class NotaService {
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
        return res.rows.map(row => new Nota({
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
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
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

        const row = res.rows[0];
        return new Nota({
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
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async create(novaNotaData) {
        await this.validarNota(novaNotaData);

        const novaNota = new NovaNota(novaNotaData);
        
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

        const row = res.rows[0];
        return new Nota({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre, 
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async update(id, updateData) {
        const notaExistente = await this.getById(id);
        if (!notaExistente) {
            throw new Error('Nota não encontrada');
        }

        if (updateData.nota !== undefined && (updateData.nota < 0 || updateData.nota > 10)) {
            throw new Error('Nota deve estar entre 0 e 10');
        }

        if (updateData.trimestre !== undefined && (updateData.trimestre < 1 || updateData.trimestre > 4)) {
            throw new Error('Trimestre deve ser entre 1 e 4');
        }

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
        const row = res.rows[0];

        return new Nota({
            id: row.id_notas,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            idTurma: row.id_turma,
            trimestre: row.trimestre,
            nota: parseFloat(row.nota),
            anoLetivo: row.ano_letivo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    async delete(id) {
        const res = await this.db.query('DELETE FROM notas WHERE id_notas = $1', [id]);
        if (res.rowCount === 0) throw new Error('Nota não encontrada');
    }

    async getMediasTrimestrais(idAluno, anoLetivo) {
        const query = `
            SELECT 
                id_disciplina,
                d.nome as disciplina_nome,
                trimestre,
                ROUND(AVG(nota), 2) as media,
                COUNT(*) as quantidade_avaliacoes
            FROM notas n
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            WHERE id_aluno = $1 AND ano_letivo = $2
            GROUP BY id_disciplina, d.nome, trimestre
            ORDER BY id_disciplina, trimestre
        `;
        
        const res = await this.db.query(query, [idAluno, anoLetivo]);
        return res.rows;
    }

    async getSituacaoFinal(idAluno, anoLetivo) {
        const query = `
            SELECT 
                d.id_disciplinas,
                d.nome as disciplina_nome,
                ROUND(AVG(n.nota), 2) as media_anual,
                CASE 
                    WHEN AVG(n.nota) >= 7 THEN 'Aprovado'
                    WHEN AVG(n.nota) >= 5 THEN 'Recuperação'
                    ELSE 'Reprovado'
                END as situacao
            FROM notas n
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            WHERE n.id_aluno = $1 AND n.ano_letivo = $2
            GROUP BY d.id_disciplinas, d.nome
        `;
        
        const res = await this.db.query(query, [idAluno, anoLetivo]);
        return res.rows;
    }

    async getNotasPorTurma(idTurma, anoLetivo, trimestre) {
        const query = `
            SELECT 
                n.id_notas,
                a.id_alunos,
                a.nome as aluno_nome,
                d.id_disciplinas,
                d.nome as disciplina_nome,
                n.nota,
                n.trimestre
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            JOIN disciplinas d ON n.id_disciplina = d.id_disciplinas
            WHERE n.id_turma = $1 
            AND n.ano_letivo = $2 
            AND n.trimestre = $3
            ORDER BY a.nome, d.nome
        `;
        
        const res = await this.db.query(query, [idTurma, anoLetivo, trimestre]);
        return res.rows;
    }

    async getBoletimCompleto(idAluno, anoLetivo) {
        const notas = await this.list({ 
            idAluno, 
            anoLetivo 
        });
        
        const medias = await this.getMediasTrimestrais(idAluno, anoLetivo);
        const situacao = await this.getSituacaoFinal(idAluno, anoLetivo);

        return {
            aluno: idAluno,
            anoLetivo,
            notas,
            mediasTrimestrais: medias,
            situacaoFinal: situacao
        };
    }

    async getEstatisticasTurma(idTurma, anoLetivo, trimestre, idDisciplina) {
        let query = `
            SELECT 
                n.nota,
                a.id_alunos
            FROM notas n
            JOIN alunos a ON n.id_aluno = a.id_alunos
            WHERE n.id_turma = $1 AND n.ano_letivo = $2
        `;
        
        const params = [idTurma, anoLetivo];
        let paramCount = 2;

        if (trimestre) {
            paramCount++;
            query += ` AND n.trimestre = $${paramCount}`;
            params.push(trimestre);
        }

        if (idDisciplina) {
            paramCount++;
            query += ` AND n.id_disciplina = $${paramCount}`;
            params.push(idDisciplina);
        }

        const res = await this.db.query(query, params);
        const notas = res.rows.map(row => ({
            nota: parseFloat(row.nota),
            idAluno: row.id_alunos
        }));

        const valoresNotas = notas.map(n => n.nota);
        const totalNotas = valoresNotas.length;

        if (totalNotas === 0) {
            return {
                totalAlunos: 0,
                totalNotas: 0,
                mediaGeral: 0,
                maiorNota: 0,
                menorNota: 0,
                aprovados: 0,
                recuperacao: 0,
                reprovados: 0
            };
        }

        return {
            totalAlunos: new Set(notas.map(n => n.idAluno)).size,
            totalNotas: totalNotas,
            mediaGeral: Number((valoresNotas.reduce((sum, nota) => sum + nota, 0) / totalNotas).toFixed(2)),
            maiorNota: Math.max(...valoresNotas),
            menorNota: Math.min(...valoresNotas),
            aprovados: valoresNotas.filter(nota => nota >= 7).length,
            recuperacao: valoresNotas.filter(nota => nota >= 5 && nota < 7).length,
            reprovados: valoresNotas.filter(nota => nota < 5).length
        };
    }

    async validarNota(notaData) {
        if (notaData.nota < 0 || notaData.nota > 10) {
            throw new Error('Nota deve estar entre 0 e 10');
        }

        if (notaData.trimestre < 1 || notaData.trimestre > 4) {
            throw new Error('Trimestre deve ser entre 1 e 4');
        }

        const checkQuery = `
            SELECT id_notas FROM notas 
            WHERE id_aluno = $1 
            AND id_disciplina = $2 
            AND id_turma = $3 
            AND ano_letivo = $4 
            AND trimestre = $5
        `;
        
        const checkResult = await this.db.query(checkQuery, [
            notaData.idAluno,
            notaData.idDisciplina,
            notaData.idTurma,
            notaData.anoLetivo,
            notaData.trimestre
        ]);

        if (checkResult.rows.length > 0) {
            throw new Error('Já existe uma nota para este aluno nesta disciplina, turma, ano e trimestre');
        }
    }
}