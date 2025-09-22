import { z } from 'zod';

const novoAlunoSchema = z.object({
    nome: z.string(),
    cns: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    genero: z.string(),
    religiao: z.string().nullable().optional(),
    telefone: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    responsavel1Nome: z.string(),
    responsavel1Cpf: z.string(),
    responsavel1Telefone: z.string(),
    responsavel1Parentesco: z.string(),
    responsavel2Nome: z.string().nullable().optional(),
    responsavel2Cpf: z.string().nullable().optional(),
    responsavel2Telefone: z.string().nullable().optional(),
    responsavel2Parentesco: z.string().nullable().optional()
});

const alunoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    cns: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    genero: z.string(),
    religiao: z.string().nullable().optional(),
    telefone: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    responsavel1Nome: z.string(),
    responsavel1Cpf: z.string(),
    responsavel1Telefone: z.string(),
    responsavel1Parentesco: z.string(),
    responsavel2Nome: z.string().nullable().optional(),
    responsavel2Cpf: z.string().nullable().optional(),
    responsavel2Telefone: z.string().nullable().optional(),
    responsavel2Parentesco: z.string().nullable().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class NovoAluno {
    /**
     * @param {{
     *   nome: string,
     *   cns: string,
     *   nascimento: string|Date,
     *   genero: string,
     *   religiao?: string|null,
     *   telefone: string,
     *   logradouro: string,
     *   numero: string,
     *   bairro: string,
     *   cep: string,
     *   cidade: string,
     *   estado: string,
     *   responsavel1Nome: string,
     *   responsavel1Cpf: string,
     *   responsavel1Telefone: string,
     *   responsavel1Parentesco: string,
     *   responsavel2Nome?: string|null,
     *   responsavel2Cpf?: string|null,
     *   responsavel2Telefone?: string|null,
     *   responsavel2Parentesco?: string|null
     * }} obj
     */
    constructor(obj) {
        const validated = novoAlunoSchema.parse(obj);

        this.nome = validated.nome;
        this.cns = validated.cns;
        this.nascimento = validated.nascimento instanceof Date ? validated.nascimento : new Date(validated.nascimento);
        this.genero = validated.genero;
        this.religiao = validated.religiao ?? null;
        this.telefone = validated.telefone;
        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;
        this.responsavel1Nome = validated.responsavel1Nome;
        this.responsavel1Cpf = validated.responsavel1Cpf;
        this.responsavel1Telefone = validated.responsavel1Telefone;
        this.responsavel1Parentesco = validated.responsavel1Parentesco;
        this.responsavel2Nome = validated.responsavel2Nome ?? null;
        this.responsavel2Cpf = validated.responsavel2Cpf ?? null;
        this.responsavel2Telefone = validated.responsavel2Telefone ?? null;
        this.responsavel2Parentesco = validated.responsavel2Parentesco ?? null;
    }
}

export class Aluno {
    /**
     * @param {{
     *   id: number,
     *   nome: string,
     *   cns: string,
     *   nascimento: string|Date,
     *   genero: string,
     *   religiao?: string|null,
     *   telefone: string,
     *   logradouro: string,
     *   numero: string,
     *   bairro: string,
     *   cep: string,
     *   cidade: string,
     *   estado: string,
     *   responsavel1Nome: string,
     *   responsavel1Cpf: string,
     *   responsavel1Telefone: string,
     *   responsavel1Parentesco: string,
     *   responsavel2Nome?: string|null,
     *   responsavel2Cpf?: string|null,
     *   responsavel2Telefone?: string|null,
     *   responsavel2Parentesco?: string|null,
     *   createdAt?: Date|string,
     *   updatedAt?: Date|string
     * }} obj
     */
    constructor(obj) {
        const validated = alunoSchema.parse(obj);

        this.id = validated.id;
        this.nome = validated.nome;
        this.cns = validated.cns;
        this.nascimento = validated.nascimento instanceof Date ? validated.nascimento : new Date(validated.nascimento);
        this.genero = validated.genero;
        this.religiao = validated.religiao ?? null;
        this.telefone = validated.telefone;
        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;
        this.responsavel1Nome = validated.responsavel1Nome;
        this.responsavel1Cpf = validated.responsavel1Cpf;
        this.responsavel1Telefone = validated.responsavel1Telefone;
        this.responsavel1Parentesco = validated.responsavel1Parentesco;
        this.responsavel2Nome = validated.responsavel2Nome ?? null;
        this.responsavel2Cpf = validated.responsavel2Cpf ?? null;
        this.responsavel2Telefone = validated.responsavel2Telefone ?? null;
        this.responsavel2Parentesco = validated.responsavel2Parentesco ?? null;
        this.createdAt = validated.createdAt ? (validated.createdAt instanceof Date ? validated.createdAt : new Date(validated.createdAt)) : undefined;
        this.updatedAt = validated.updatedAt ? (validated.updatedAt instanceof Date ? validated.updatedAt : new Date(validated.updatedAt)) : undefined;
    }
}