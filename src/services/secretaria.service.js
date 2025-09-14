import { NovoSecretaria, Secretaria } from '../entities/secretaria.js';

import { UsuarioService } from './usuario.service.js';

export class SecretariaService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     * @param {UsuarioService} usuarioService
     */
    constructor(db, usuarioService) {
        this.db = db;
        this.usuarioService = usuarioService;
    }

    /**
     * Cria uma nova secretaria (usando usuário existente)
     * @param {NovoSecretaria} novoSecretaria
     * @returns {Promise<Secretaria>}
     */
    async create(novoSecretaria) {
        // Cria secretaria usando o idUsuario fornecido
        const res = await this.db.query(
            "INSERT INTO secretarias (id_usuario) VALUES ($1) RETURNING *",
            [novoSecretaria.idUsuario]
        );

        const row = res.rows[0];

        return Secretaria.fromObj({
            id: row.id_secretarias,
            idUsuario: novoSecretaria.idUsuario,
        });
    }

    /**
     * Lista todas as secretarias
     * @returns {Promise<Secretaria[]>}
     */
    async list() {
        const res = await this.db.query(
            `SELECT s.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM secretarias s
             JOIN usuarios u ON s.id_usuario = u.id_usuarios`
        );
        return res.rows.map(row =>
            Secretaria.fromObj({
                id: row.id_secretarias,
                idUsuario: row.id_usuario,
            })
        );
    }

    /**
     * Busca uma secretaria pelo ID
     * @param {number} id
     * @returns {Promise<Secretaria|null>}
     */
    async getById(id) {
        const res = await this.db.query(
            `SELECT s.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM secretarias s
             JOIN usuarios u ON s.id_usuario = u.id_usuarios
             WHERE s.id_secretarias = $1`,
            [id]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return Secretaria.fromObj({
            id: row.id_secretarias,
            idUsuario: row.id_usuario,
        });
    }

    /**
     * Atualiza dados da secretaria
     * @param {number} id
     * @param {NovoSecretaria} novoSecretaria
     * @returns {Promise<Secretaria>}
     */
    async update(id, novoSecretaria) {
        // Atualiza o id_usuario da secretaria
        const res = await this.db.query(
            "UPDATE secretarias SET id_usuario = $1 WHERE id_secretarias = $2 RETURNING *",
            [novoSecretaria.idUsuario, id]
        );
        if (res.rows.length === 0) throw new Error("Secretaria não encontrada");

        const row = res.rows[0];

        return Secretaria.fromObj({
            id: row.id_secretarias,
            idUsuario: row.id_usuario,
        });
    }

    /**
     * Deleta uma secretaria e seu usuário
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        // Busca secretaria para pegar id_usuario
        const res = await this.db.query(
            "SELECT id_usuario FROM secretarias WHERE id_secretarias = $1",
            [id]
        );
        if (res.rows.length === 0) throw new Error("Secretaria não encontrada");
        const id_usuario = res.rows[0].id_usuario;

        // Deleta secretaria
        await this.db.query("DELETE FROM secretarias WHERE id_secretarias = $1", [id]);
        // Deleta usuário
        await this.db.query("DELETE FROM usuarios WHERE id_usuarios = $1", [id_usuario]);
    }

    /**
     * Busca uma secretaria pelo id_usuario
     * @param {number} usuarioId
     * @returns {Promise<Secretaria|null>}
     */
    async getByUsuarioId(usuarioId) {
        const res = await this.db.query(
            `SELECT s.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM secretarias s
             JOIN usuarios u ON s.id_usuario = u.id_usuarios
             WHERE s.id_usuario = $1`,
            [usuarioId]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];

        return Secretaria.fromObj({
            id: row.id_secretarias,
            idUsuario: row.id_usuario,
        });
    }
}
