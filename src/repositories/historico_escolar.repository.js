import { NovoHistoricoEscolar, HistoricoEscolar } from '../entities/historico_escolar.js';

export class HistoricoEscolarRepository {
    /**
     * @param {import('../db/index.js').PoolClient} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Lista todos os históricos escolares
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async list() {
        const res = await this.db.query(
            `SELECT * FROM historicos_escolares`
        );

        return res.rows.map(row => HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    /**
     * Busca um histórico escolar pelo ID
     * @param {number} id
     * @returns {Promise<HistoricoEscolar|null>}
     */
    async getById(id) {
        const res = await this.db.query(
            `SELECT * FROM historicos_escolares WHERE id_historicos_escolares = $1`,
            [id]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];
        return HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Busca históricos escolares por aluno ID
     * @param {number} alunoId
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async getByAlunoId(alunoId) {
        const res = await this.db.query(
            `SELECT * FROM historicos_escolares WHERE id_aluno = $1`,
            [alunoId]
        );

        return res.rows.map(row => HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    /**
     * Busca históricos escolares por disciplina ID
     * @param {number} disciplinaId
     * @returns {Promise<HistoricoEscolar[]>}
     */
    async getByDisciplinaId(disciplinaId) {
        const res = await this.db.query(
            `SELECT * FROM historicos_escolares WHERE id_disciplina = $1`,
            [disciplinaId]
        );

        return res.rows.map(row => HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    /**
     * Cria um novo histórico escolar
     * @param {NovoHistoricoEscolar} novoHistoricoEscolar
     * @returns {Promise<HistoricoEscolar>}
     */
    async create(novoHistoricoEscolar) {
        const res = await this.db.query(
            `INSERT INTO historicos_escolares (
                id_aluno,
                id_disciplina,
                nome_escola,
                serie_concluida,
                nota,
                ano_conclusao
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                novoHistoricoEscolar.idAluno,
                novoHistoricoEscolar.idDisciplina,
                novoHistoricoEscolar.nomeEscola,
                novoHistoricoEscolar.serieConcluida,
                novoHistoricoEscolar.nota,
                novoHistoricoEscolar.anoConclusao
            ]
        );

        const row = res.rows[0];
        return HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Atualiza dados do histórico escolar
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<HistoricoEscolar>}
     */
    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE historicos_escolares SET 
                id_aluno = $1,
                id_disciplina = $2,
                nome_escola = $3,
                serie_concluida = $4,
                nota = $5,
                ano_conclusao = $6,
                updated_at = NOW()
            WHERE id_historicos_escolares = $7
            RETURNING *`,
            [
                updateData.idAluno,
                updateData.idDisciplina,
                updateData.nomeEscola,
                updateData.serieConcluida,
                updateData.nota,
                updateData.anoConclusao,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Histórico escolar não encontrado");

        const row = res.rows[0];
        return HistoricoEscolar.fromObj({
            id: row.id_historicos_escolares,
            idAluno: row.id_aluno,
            idDisciplina: row.id_disciplina,
            nomeEscola: row.nome_escola,
            serieConcluida: row.serie_concluida,
            nota: row.nota,
            anoConclusao: row.ano_conclusao,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Deleta um histórico escolar
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const res = await this.db.query("DELETE FROM historicos_escolares WHERE id_historicos_escolares = $1", [id]);
        if (res.rowCount === 0) throw new Error("Histórico escolar não encontrado");
    }
}