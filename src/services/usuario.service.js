// src/services/usuario.service.js
import { NovoUsuario, Usuario } from '../entities/usuario.js';
import { HashingService } from './hashing.service.js';

export class UsuarioService {
    constructor(db, hashingService) {
        this.db = db;
        this.hashingService = hashingService;
    }

    async list() {
        try {
            const res = await this.db.query("SELECT * FROM usuarios");
            return res.rows.map((r) => Usuario.fromRow(r));
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const res = await this.db.query("SELECT * FROM usuarios WHERE id_usuarios = $1", [id]);
            if (res.rows.length === 0) {
                return null;
            }
            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async getByEmail(email) {
        try {
            const res = await this.db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
            if (res.rows.length === 0) {
                return null;
            }
            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    async create(novoUsuario) {
        try {
            console.log('Criando novo usuário:', { email: novoUsuario.email, tipo: novoUsuario.tipo_usuario });
            
            const passwordHash = await this.hashingService.hash(novoUsuario.senha);

            const res = await this.db.query(
                "INSERT INTO usuarios (nome, email, hash_senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING *",
                [novoUsuario.nome, novoUsuario.email, passwordHash, novoUsuario.tipo_usuario]
            );

            console.log('Usuário criado com sucesso');
            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            
            // Verifica se é erro de duplicata (email já existe)
            if (error.code === '23505') { // Código de violação de constraint única
                throw new Error('Email já está em uso');
            }
            
            throw new Error(`Erro ao criar usuário: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            const passwordHash = updateData.senha 
                ? await this.hashingService.hash(updateData.senha)
                : undefined;

            let query;
            let params;

            if (passwordHash) {
                query = "UPDATE usuarios SET nome = $1, email = $2, hash_senha = $3, tipo_usuario = $4 WHERE id_usuarios = $5 RETURNING *";
                params = [updateData.nome, updateData.email, passwordHash, updateData.tipo_usuario, id];
            } else {
                query = "UPDATE usuarios SET nome = $1, email = $2, tipo_usuario = $3 WHERE id_usuarios = $4 RETURNING *";
                params = [updateData.nome, updateData.email, updateData.tipo_usuario, id];
            }

            const res = await this.db.query(query, params);

            if (res.rows.length === 0) {
                throw new Error("Usuário não encontrado");
            }

            return Usuario.fromRow(res.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const res = await this.db.query("DELETE FROM usuarios WHERE id_usuarios = $1", [id]);
            if (res.rowCount === 0) {
                throw new Error("Usuário não encontrado");
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw error;
        }
    }
}