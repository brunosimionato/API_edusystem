import { NovaDisciplina, Disciplina } from '../entities/disciplina.js';

export class DisciplinaService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Lista todas as disciplinas
     * @returns {Promise<Disciplina[]>}
     */
    async list() {
        const res = await this.db.query("SELECT * FROM disciplinas");
        return res.rows.map(row => Disciplina.fromObj({
            id: row.id_disciplinas,
            nome: row.nome,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    /**
     * Busca uma disciplina pelo ID
     * @param {number} id
     * @returns {Promise<Disciplina|null>}
     */
    async getById(id) {
        const res = await this.db.query("SELECT * FROM disciplinas WHERE id_disciplinas = $1", [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];

        return Disciplina.fromObj({
            id: row.id_disciplinas,
            nome: row.nome,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Cria uma nova disciplina
     * @param {NovaDisciplina} novoDisciplina
     * @returns {Promise<Disciplina>}
     */
    async create(novoDisciplina) {
        const res = await this.db.query(
            "INSERT INTO disciplinas (nome) VALUES ($1) RETURNING *",
            [novoDisciplina.nome]
        );
        const row = res.rows[0];
        return Disciplina.fromObj({
            id: row.id_disciplinas,
            nome: row.nome,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Atualiza uma disciplina existente
     * @param {number} id
     * @param {NovaDisciplina} novoDisciplina
     * @returns {Promise<Disciplina>}
     */
    async update(id, novoDisciplina) {
        const res = await this.db.query(
            "UPDATE disciplinas SET nome = $1 WHERE id_disciplinas = $2 RETURNING *",
            [novoDisciplina.nome, id]
        );
        if (res.rows.length === 0) throw new Error("Disciplina não encontrada");
        const row = res.rows[0];
        return Disciplina.fromObj({
            id: row.id_disciplinas,
            nome: row.nome,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Deleta uma disciplina
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const res = await this.db.query("DELETE FROM disciplinas WHERE id_disciplinas = $1", [id]);
        if (res.rowCount === 0) throw new Error("Disciplina não encontrada");
    }
}
