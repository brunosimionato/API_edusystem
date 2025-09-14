import { hash } from 'bcrypt'

import { NovoUsuario, Usuario } from '../entities/usuario.js';

import { HashingService } from './hashing.service.js';

export class UsuarioService {
    /**
     * @param {import('../db/index.js').PoolClient}
     * @param {HashingService} hashingService
     */
    constructor(db, hashingService) {
        this.db = db;
        this.hashingService = hashingService;
    }

    /**
     * Seleciona todos os usuários do banco de dados
     * @returns {Promise<Usuario[]>}
     */
    async list() {
        const res = await this.db.query("SELECT * FROM usuarios");
        return res.rows.map((r) => Usuario.fromRow(r));
    }

    /**
     * Obtém um usuário pelo ID, se existir 
     * @param {number} id 
     * @returns {Promise<Usuario|null>}
     */
    async getById(id) {
        const res = await this.db.query("SELECT * FROM usuarios WHERE id_usuarios = $1", [id]);

        if (res.rows.length === 0) {
            return null;
        }

        return Usuario.fromRow(res.rows[0]);
    }

    /**
     * Obtém um usuário pelo email, se existir
     * @param {string} email
     * @returns {Promise<Usuario|null>}
     */
    async getByEmail(email) {
        const res = await this.db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (res.rows.length === 0) {
            return null;
        }

        return Usuario.fromRow(res.rows[0]);
    }

    /**
     * Cria um novo usuário no banco de dados
     * @param {NovoUsuario} novoUsuario - O usuário a ser criado
     * 
     * @returns {Promise<Usuario>} retorna o usuário criado
     */
    async create(novoUsuario) {
        console.log('Criando novo usuário:', novoUsuario);
        const passwordHash = await this.hashingService.hash(novoUsuario.senha);

        const res = await this.db.query(
            "INSERT INTO usuarios (nome, email, hash_senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING *",
            [novoUsuario.nome, novoUsuario.email, passwordHash, novoUsuario.tipo_usuario]
        );

        return Usuario.fromRow(res.rows[0]);
    }

    /**
     * Atualiza um usuário existente no banco de dados
     * @param {number} id - ID do usuário a ser atualizado
     * @param {NovoUsuario} novoUsuario - Dados atualizados do usuário
     * 
     * @returns {Promise<Usuario>} retorna o usuário atualizado
     */
    async update(id, novoUsuario) {
        const passwordHash = await hash(novoUsuario.senha, 10);

        const res = await this.db.query(
            "UPDATE usuarios SET nome = $1, email = $2, hash_senha = $3, tipo_usuario = $4 WHERE id_usuarios = $5 RETURNING *",
            [novoUsuario.nome, novoUsuario.email, passwordHash, novoUsuario.tipo_usuario, id]
        );

        if (res.rows.length === 0) {
            throw new Error("Usuário não encontrado");
        }

        return Usuario.fromRow(res.rows[0]);
    }

    /**
     * Deleta um usuário do banco de dados
     * @param {number} id - ID do usuário a ser deletado
     * 
     * @returns {Promise<void>}
     */
    async delete(id) {
        const res = await this.db.query("DELETE FROM usuarios WHERE id_usuarios = $1", [id]);

        if (res.rowCount === 0) {
            throw new Error("Usuário não encontrado");
        }
    }
}
