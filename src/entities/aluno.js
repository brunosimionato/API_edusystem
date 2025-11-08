import { z } from "zod";

/**
 */
const novoAlunoSchema = z.object({
    nome: z.string(),
    cpf: z.string(),
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

    turma: z.union([z.number(), z.string()]).nullable().optional(),

    /**
     * Histórico escolar
     */
    historicoEscolar: z
        .array(
            z.object({
                escolaAnterior: z.string(),
                serieAnterior: z.string(),
                anoConclusao: z.union([z.string(), z.number()]),
                notas: z.any().optional()
            })
        )
        .nullable()
        .optional(),
});

/**
 * SCHEMA para validar aluno retornado pelo banco
 */
const alunoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    cpf: z.string(),
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
    updatedAt: z.union([z.string(), z.date()]).optional(),
});

/**
 * Classe usada no CREATE (validação com schema)
 */
export class NovoAluno {
    constructor(obj) {
        const validated = novoAlunoSchema.parse(obj);

        this.nome = validated.nome;
        this.cpf = validated.cpf;
        this.cns = validated.cns;
        this.nascimento =
            validated.nascimento instanceof Date
                ? validated.nascimento
                : new Date(validated.nascimento);
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

        this.turma = validated.turma ?? null;
        this.historicoEscolar = validated.historicoEscolar ?? null;
    }
}

/**
 * Classe usada no retorno do banco (DTO)
 */
export class Aluno {
    constructor(obj) {
        const validated = alunoSchema.parse(obj);

        this.id = validated.id;
        this.nome = validated.nome;
        this.cpf = validated.cpf;
        this.cns = validated.cns;
        this.nascimento =
            validated.nascimento instanceof Date
                ? validated.nascimento
                : new Date(validated.nascimento);
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

        this.createdAt = validated.createdAt
            ? new Date(validated.createdAt)
            : undefined;
        this.updatedAt = validated.updatedAt
            ? new Date(validated.updatedAt)
            : undefined;
    }
}
