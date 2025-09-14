import { z } from 'zod';

const novoUsuarioSchema = z.object({
    nome: z.string(),
    email: z.string().email(),
    senha: z.string(),
    tipo_usuario: z.string()
});

const usuarioSchema = z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string().email(),
    hash_senha: z.string(),
    tipo_usuario: z.string()
});

export class NovoUsuario {
    /**
     * @param {{
     *   nome: string,
     *   email: string,
     *   senha: string,
     *   tipo_usuario: string
     * }} obj
     */
    constructor(obj) {
        const validated = novoUsuarioSchema.parse(obj);
        this.nome = validated.nome;
        this.email = validated.email;
        this.senha = validated.senha;
        this.tipo_usuario = validated.tipo_usuario;
    }

    /**
     * Cria uma instância de NovoUsuario a partir de um objeto
     * @param {Object} obj
     * @returns {NovoUsuario}
     */
    static fromObj(obj) {
        return new NovoUsuario(obj);
    }
}

export class Usuario {
    /**
     * @param {{
     *   id: number,
     *   nome: string,
     *   email: string,
     *   hash_senha: string,
     *   tipo_usuario: string
     * }} obj
     */
    constructor(obj) {
        const validated = usuarioSchema.parse(obj);
        this.id = validated.id;
        this.nome = validated.nome;
        this.email = validated.email;
        this.hash_senha = validated.hash_senha;
        this.tipo_usuario = validated.tipo_usuario;
    }

    /**
     * Cria uma instância de Usuario a partir de uma linha do banco de dados
     * @param {Object} row - A linha do banco de dados
     * @return {Usuario} Uma instância de Usuario
     */
    static fromRow(row) {
        return new Usuario({
            id: row.id_usuarios,
            nome: row.nome,
            email: row.email,
            hash_senha: row.hash_senha,
            tipo_usuario: row.tipo_usuario
        });
    }

    /**
     * Cria uma instância de Usuario a partir de um objeto
     * @param {Object} obj
     * @returns {Usuario}
     */
    static fromObj(obj) {
        return new Usuario(obj);
    }
}
