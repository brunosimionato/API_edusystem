import { z } from 'zod';
import { format } from 'date-fns'

import { Usuario, NovoUsuario } from './usuario.js';

const novoAlunoSchema = z.object({
    usuario: z.object({
        nome: z.string(),
        email: z.string().email(),
        senha: z.string(),
        tipo_usuario: z.string()
    }),
    data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    responsavel_nome: z.string().nullable().optional(),
    nome_pai: z.string().nullable().optional(),
    nome_mae: z.string().nullable().optional(),
    profissao_pai: z.string().nullable().optional(),
    profissao_mae: z.string().nullable().optional(),
    alergias: z.string().nullable().optional(),
    telefone_pai: z.string().nullable().optional(),
    telefone_mae: z.string().nullable().optional(),
    email_pai: z.string().nullable().optional(),
    email_mae: z.string().nullable().optional(),
    idade: z.number().nullable().optional(),
    religiao: z.string().nullable().optional()
});

const alunoSchema = z.object({
    id: z.number(),
    usuario: z.object({
        id: z.number(),
        nome: z.string(),
        email: z.string().email(),
        hash_senha: z.string(),
        tipo_usuario: z.string()
    }),
    data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    responsavel_nome: z.string().nullable().optional(),
    nome_pai: z.string().nullable().optional(),
    nome_mae: z.string().nullable().optional(),
    profissao_pai: z.string().nullable().optional(),
    profissao_mae: z.string().nullable().optional(),
    alergias: z.string().nullable().optional(),
    telefone_pai: z.string().nullable().optional(),
    telefone_mae: z.string().nullable().optional(),
    email_pai: z.string().nullable().optional(),
    email_mae: z.string().nullable().optional(),
    idade: z.number().nullable().optional(),
    religiao: z.string().nullable().optional()
});

// Representa um novo aluno a ser criado (antes de existir no banco)
export class NovoAluno {
    /**
     * @param {{
     *   usuario: {
     *     nome: string,
     *     email: string,
     *     senha: string,
     *     tipo_usuario: string
     *   },
     *   data_nascimento?: string|null,
     *   responsavel_nome?: string|null,
     *   nome_pai?: string|null,
     *   nome_mae?: string|null,
     *   profissao_pai?: string|null,
     *   profissao_mae?: string|null,
     *   alergias?: string|null,
     *   telefone_pai?: string|null,
     *   telefone_mae?: string|null,
     *   email_pai?: string|null,
     *   email_mae?: string|null,
     *   idade?: number|null,
     *   religiao?: string|null
     * }} obj
     */
    constructor(obj) {
        const validated = novoAlunoSchema.parse(obj);
        this.usuario = new NovoUsuario(validated.usuario);
        this.data_nascimento = validated.data_nascimento ?? null;
        this.responsavel_nome = validated.responsavel_nome ?? null;
        this.nome_pai = validated.nome_pai ?? null;
        this.nome_mae = validated.nome_mae ?? null;
        this.profissao_pai = validated.profissao_pai ?? null;
        this.profissao_mae = validated.profissao_mae ?? null;
        this.alergias = validated.alergias ?? null;
        this.telefone_pai = validated.telefone_pai ?? null;
        this.telefone_mae = validated.telefone_mae ?? null;
        this.email_pai = validated.email_pai ?? null;
        this.email_mae = validated.email_mae ?? null;
        this.idade = validated.idade ?? null;
        this.religiao = validated.religiao ?? null;
    }

    /**
     * Cria uma instância de NovoAluno a partir de um objeto
     * @param {Object} obj
     * @returns {NovoAluno}
     */
    static fromObj(obj) {
        return new NovoAluno(obj);
    }
}

// Representa um aluno existente no banco
export class Aluno {
    /**
     * @param {{
     *   id: number,
     *   usuario: {
     *     id: number,
     *     nome: string,
     *     email: string,
     *     hash_senha: string,
     *     tipo_usuario: string
     *   },
     *   data_nascimento?: string|null,
     *   responsavel_nome?: string|null,
     *   nome_pai?: string|null,
     *   nome_mae?: string|null,
     *   profissao_pai?: string|null,
     *   profissao_mae?: string|null,
     *   alergias?: string|null,
     *   telefone_pai?: string|null,
     *   telefone_mae?: string|null,
     *   email_pai?: string|null,
     *   email_mae?: string|null,
     *   idade?: number|null,
     *   religiao?: string|null
     * }} obj
     */
    constructor(obj) {
        const validated = alunoSchema.parse(obj);
        this.id = validated.id;
        this.usuario = new Usuario(validated.usuario);
        this.data_nascimento = validated.data_nascimento ?? null;
        this.responsavel_nome = validated.responsavel_nome ?? null;
        this.nome_pai = validated.nome_pai ?? null;
        this.nome_mae = validated.nome_mae ?? null;
        this.profissao_pai = validated.profissao_pai ?? null;
        this.profissao_mae = validated.profissao_mae ?? null;
        this.alergias = validated.alergias ?? null;
        this.telefone_pai = validated.telefone_pai ?? null;
        this.telefone_mae = validated.telefone_mae ?? null;
        this.email_pai = validated.email_pai ?? null;
        this.email_mae = validated.email_mae ?? null;
        this.idade = validated.idade ?? null;
        this.religiao = validated.religiao ?? null;
    }

    /**
     * Cria uma instância de Aluno a partir de uma linha do banco de dados
     * @param {Object} row
     * @param {Usuario} usuario
     * @returns {Aluno}
     */
    static fromRow(row, usuario) {
        const data_nascimento = row.data_nascimento ? format(new Date(row.data_nascimento), 'yyyy-MM-dd') : null
        return new Aluno({
            id: row.id_alunos,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                hash_senha: usuario.hash_senha,
                tipo_usuario: usuario.tipo_usuario
            },
            data_nascimento: data_nascimento,
            responsavel_nome: row.responsavel_nome,
            nome_pai: row.nome_pai,
            nome_mae: row.nome_mae,
            profissao_pai: row.profissao_pai,
            profissao_mae: row.profissao_mae,
            alergias: row.alergias,
            telefone_pai: row.telefone_pai,
            telefone_mae: row.telefone_mae,
            email_pai: row.email_pai,
            email_mae: row.email_mae,
            idade: row.idade,
            religiao: row.religiao
        });
    }

    /**
     * Cria uma instância de Aluno a partir de um objeto
     * @param {Object} obj
     * @returns {Aluno}
     */
    static fromObj(obj) {
        return new Aluno(obj);
    }
}