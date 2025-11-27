import { z } from 'zod';

const novoProfessorSchema = z.object({
    idUsuario: z.number().optional(),

    idDisciplinaEspecialidade: z.number().optional(),

    telefone: z.string(),
    genero: z.string(),
    cpf: z.string(),

    nascimento: z.union([z.string(), z.date()]),

    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),

    formacaoAcademica: z.string(),

    idDisciplinas: z.array(z.number()).optional(),
    turmas: z.array(z.number()).optional()
});


export class NovoProfessor {
    constructor(obj) {

        const validated = novoProfessorSchema.parse({
            ...obj,
            idUsuario: obj.idUsuario ?? obj.id_usuario,
            idDisciplinaEspecialidade:
                obj.idDisciplinaEspecialidade ?? obj.id_disciplina_especialidade,
            formacaoAcademica:
                obj.formacaoAcademica ?? obj.formacao_academica
        });

        this.idUsuario = validated.idUsuario;
        this.idDisciplinaEspecialidade = validated.idDisciplinaEspecialidade ?? null;

        this.telefone = validated.telefone;
        this.genero = validated.genero;
        this.cpf = validated.cpf;

        this.nascimento =
            validated.nascimento instanceof Date
                ? validated.nascimento
                : new Date(validated.nascimento);

        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;

        this.formacaoAcademica = validated.formacaoAcademica;

        this.idDisciplinas = validated.idDisciplinas ?? [];
        this.turmas = validated.turmas ?? [];
    }

    static fromObj(obj) {
        return new NovoProfessor(obj);
    }
}


const professorSchema = z.object({
    id: z.number(),
    idUsuario: z.number(),

    idDisciplinaEspecialidade: z.number().nullable().optional(),

    telefone: z.string(),
    genero: z.string(),
    cpf: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    formacaoAcademica: z.string(),

    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class Professor {
    constructor(obj) {

        const validated = professorSchema.parse({
            ...obj,
            id: obj.id ?? obj.id_professores,
            idUsuario: obj.idUsuario ?? obj.id_usuario,
            idDisciplinaEspecialidade:
                obj.idDisciplinaEspecialidade ?? obj.id_disciplina_especialidade ?? null,
            formacaoAcademica:
                obj.formacaoAcademica ?? obj.formacao_academica,
            createdAt: obj.createdAt ?? obj.created_at,
            updatedAt: obj.updatedAt ?? obj.updated_at
        });

        this.id = validated.id;
        this.idUsuario = validated.idUsuario;
        this.idDisciplinaEspecialidade = validated.idDisciplinaEspecialidade;

        this.telefone = validated.telefone;
        this.genero = validated.genero;
        this.cpf = validated.cpf;

        this.nascimento =
            validated.nascimento instanceof Date
                ? validated.nascimento
                : new Date(validated.nascimento);

        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;

        this.formacaoAcademica = validated.formacaoAcademica;

        this.createdAt = validated.createdAt
            ? (validated.createdAt instanceof Date
                ? validated.createdAt
                : new Date(validated.createdAt))
            : undefined;

        this.updatedAt = validated.updatedAt
            ? (validated.updatedAt instanceof Date
                ? validated.updatedAt
                : new Date(validated.updatedAt))
            : undefined;
    }

    static fromObj(obj) {
        return new Professor(obj);
    }
}
