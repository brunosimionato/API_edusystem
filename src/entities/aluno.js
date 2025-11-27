import { z } from "zod";


const novoAlunoSchema = z.object({
    nome: z.string().min(1, "Nome obrigatório"),
    cpf: z.string().min(1, "CPF obrigatório"),

    cns: z.string().nullable().optional(),

    nascimento: z.union([z.string(), z.date()]),
    genero: z.string().min(1),
    religiao: z.string().nullable().default(""),
    telefone: z.string().min(1),

    logradouro: z.string().min(1),
    numero: z.union([z.string(), z.number()])
        .transform(v => v.toString())
        .refine(v => v.trim() !== "", "Número obrigatório"),
    bairro: z.string().min(1),
    cep: z.string().min(1),
    cidade: z.string().min(1),
    estado: z.string().min(1),

    responsavel1Nome: z.string().min(1),
    responsavel1Cpf: z.string().min(1),
    responsavel1Telefone: z.string().min(1),
    responsavel1Parentesco: z.string().min(1),

    responsavel2Nome: z.string().nullable().default(""),
    responsavel2Cpf: z.string().nullable().default(""),
    responsavel2Telefone: z.string().nullable().default(""),
    responsavel2Parentesco: z.string().nullable().default(""),

    turma: z.union([z.string(), z.number()])
        .transform(v => Number(v))
        .refine(v => !isNaN(v), "Turma inválida"),

    anoLetivo: z.union([z.string(), z.number()])
        .transform(v => Number(v))
        .refine(v => !isNaN(v), "Ano letivo inválido"),

    historicoEscolar: z.array(
        z.object({
            escolaAnterior: z.string().min(1),
            serieAnterior: z.string().min(1),
            anoConclusao: z.union([z.string(), z.number()]),
            notas: z.any().optional(),
        })
    ).nullable().optional(),
});

const alunoSchema = z.object({
    id: z.number(),

    nome: z.string(),
    cpf: z.string(),
    cns: z.string().nullable().optional(),
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

    responsavel2Nome: z.string().nullable().default(""),
    responsavel2Cpf: z.string().nullable().default(""),
    responsavel2Telefone: z.string().nullable().default(""),
    responsavel2Parentesco: z.string().nullable().default(""),

    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
});


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

        this.responsavel2Nome = validated.responsavel2Nome ?? "";
        this.responsavel2Cpf = validated.responsavel2Cpf ?? "";
        this.responsavel2Telefone = validated.responsavel2Telefone ?? "";
        this.responsavel2Parentesco = validated.responsavel2Parentesco ?? "";

        this.anoLetivo = validated.anoLetivo;
        this.turma = validated.turma;

        this.historicoEscolar = validated.historicoEscolar ?? null;
    }
}

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

        this.responsavel2Nome = validated.responsavel2Nome ?? "";
        this.responsavel2Cpf = validated.responsavel2Cpf ?? "";
        this.responsavel2Telefone = validated.responsavel2Telefone ?? "";
        this.responsavel2Parentesco = validated.responsavel2Parentesco ?? "";

        this.createdAt = validated.createdAt ? new Date(validated.createdAt) : undefined;
        this.updatedAt = validated.updatedAt ? new Date(validated.updatedAt) : undefined;
    }
}
