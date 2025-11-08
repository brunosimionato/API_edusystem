// src/services/usuario.service.js
import { NovoUsuario, Usuario } from '../entities/usuario.js';

export class UsuarioService {
    constructor(db, hashingService) {
        this.db = db;
        this.hashingService = hashingService;
    }

    // ✅ Lista apenas usuários ATIVOS
    async list() {
        try {
            const res = await this.db.query(
                "SELECT * FROM usuarios ORDER BY id_usuarios ASC"
            );
            return res.rows.map((r) => Usuario.fromRow(r));
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const res = await this.db.query(
                "SELECT * FROM usuarios WHERE id_usuarios = $1",
                [id]
            );

            if (res.rows.length === 0) return null;

            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async getByEmail(email) {
        try {
            const res = await this.db.query(
                "SELECT * FROM usuarios WHERE email = $1",
                [email]
            );

            if (res.rows.length === 0) return null;

            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    async create(novoUsuario) {
        try {
            const passwordHash = await this.hashingService.hash(novoUsuario.senha);

            const res = await this.db.query(
                `INSERT INTO usuarios (nome, email, hash_senha, tipo_usuario, ativo)
                 VALUES ($1, $2, $3, $4, true) RETURNING *`,
                [novoUsuario.nome, novoUsuario.email, passwordHash, novoUsuario.tipo_usuario]
            );

            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);

            if (error.code === '23505') {
                throw new Error('Email já está em uso');
            }

            throw new Error(`Erro ao criar usuário: ${error.message}`);
        }
    }

async update(id, updateData) {
    try {
        const atual = await this.getById(id);

        if (!atual) {
            throw new Error("Usuário não encontrado");
        }

        const passwordHash = updateData.senha
            ? await this.hashingService.hash(updateData.senha)
            : atual.hash_senha;

        const res = await this.db.query(
            `UPDATE usuarios
             SET nome = $1,
                 email = $2,
                 hash_senha = $3,
                 tipo_usuario = $4,
                 updated_at = NOW()
             WHERE id_usuarios = $5
             RETURNING *`,
            [
                updateData.nome ?? atual.nome,
                updateData.email ?? atual.email,
                passwordHash,
                atual.tipo_usuario,
                id
            ]
        );

        return Usuario.fromRow(res.rows[0]);

    } catch (error) {

        // ✅ novo tratamento para email duplicado
        if (error.code === "23505") {
            throw new Error("Email já está em uso");
        }

        console.error("Erro ao atualizar usuário:", error);
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
}


    // ✅ INATIVA usuário ao invés de deletar
    async delete(id) {
        try {
            const res = await this.db.query(
                `UPDATE usuarios 
                 SET ativo = false, updated_at = NOW()
                 WHERE id_usuarios = $1 RETURNING *`,
                [id]
            );

            if (res.rowCount === 0) {
                throw new Error("Usuário não encontrado");
            }

            return { message: "Usuário inativado com sucesso" };
        } catch (error) {
            console.error('Erro ao inativar usuário:', error);
            throw error;
        }
    }

    // ✅ OPCIONAL: reativar usuário futuramente

    async reativar(id) {
        const res = await this.db.query(
            "UPDATE usuarios SET ativo = true WHERE id_usuarios = $1 RETURNING *",
            [id]
        );

        if (res.rowCount === 0) {
            throw new Error("Usuário não encontrado");
        }

        return Usuario.fromRow(res.rows[0]);
    }
    
}
