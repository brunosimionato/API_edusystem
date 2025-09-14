import { z } from 'zod';

const novoProfessorSchema = z.object({
    idUsuario: z.number().optional(),
    idDisciplinaEspecialidade: z.number(),
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
    formacaoAcademica: z.string()
});

const professorSchema = z.object({
    id: z.number(),
    idUsuario: z.number(),
    idDisciplinaEspecialidade: z.number(),
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

export class NovoProfessor {
    /**
     * @param {{
     *   idUsuario: number|undefined,
     *   idDisciplinaEspecialidade: number,
     *   telefone: string,
     *   genero: string,
     *   cpf: string,
     *   nascimento: string|Date,
     *   logradouro: string,
     *   numero: string,
     *   bairro: string,
     *   cep: string,
     *   cidade: string,
     *   estado: string,
     *   formacaoAcademica: string
     * }} obj
     */
    constructor(obj) {
        const validated = novoProfessorSchema.parse({
            ...obj,
            idUsuario: obj.idUsuario ?? obj.id_usuario,
            idDisciplinaEspecialidade: obj.idDisciplinaEspecialidade ?? obj.id_disciplina_especialidade,
            formacaoAcademica: obj.formacaoAcademica ?? obj.formacao_academica
        });

        this.idUsuario = validated.idUsuario;
        this.idDisciplinaEspecialidade = validated.idDisciplinaEspecialidade;
        this.telefone = validated.telefone;
        this.genero = validated.genero;
        this.cpf = validated.cpf;
        this.nascimento = validated.nascimento instanceof Date ? validated.nascimento : new Date(validated.nascimento);
        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;
        this.formacaoAcademica = validated.formacaoAcademica;
    }

    /**
     * Aceita camelCase ou snake_case
     * @param {Object} obj
     * @returns {NovoProfessor}
     */
    static fromObj(obj) {
        return new NovoProfessor(obj);
    }
}

export class Professor {
    /**
     * @param {{
     *   id: number,
     *   idUsuario: number,
     *   idDisciplinaEspecialidade: number,
     *   telefone: string,
     *   genero: string,
     *   cpf: string,
     *   nascimento: string|Date,
     *   logradouro: string,
     *   numero: string,
     *   bairro: string,
     *   cep: string,
     *   cidade: string,
     *   estado: string,
     *   formacaoAcademica: string,
     *   createdAt?: Date|string,
     *   updatedAt?: Date|string
     * }} obj
     */
    constructor(obj) {
        const validated = professorSchema.parse({
            ...obj,
            id: obj.id ?? obj.id_professores,
            idUsuario: obj.idUsuario ?? obj.id_usuario,
            idDisciplinaEspecialidade: obj.idDisciplinaEspecialidade ?? obj.id_disciplina_especialidade,
            formacaoAcademica: obj.formacaoAcademica ?? obj.formacao_academica,
            createdAt: obj.createdAt ?? obj.created_at,
            updatedAt: obj.updatedAt ?? obj.updated_at
        });

        this.id = validated.id;
        this.idUsuario = validated.idUsuario;
        this.idDisciplinaEspecialidade = validated.idDisciplinaEspecialidade;
        this.telefone = validated.telefone;
        this.genero = validated.genero;
        this.cpf = validated.cpf;
        this.nascimento = validated.nascimento instanceof Date ? validated.nascimento : new Date(validated.nascimento);
        this.logradouro = validated.logradouro;
        this.numero = validated.numero;
        this.bairro = validated.bairro;
        this.cep = validated.cep;
        this.cidade = validated.cidade;
        this.estado = validated.estado;
        this.formacaoAcademica = validated.formacaoAcademica;
        this.createdAt = validated.createdAt ? (validated.createdAt instanceof Date ? validated.createdAt : new Date(validated.createdAt)) : undefined;
        this.updatedAt = validated.updatedAt ? (validated.updatedAt instanceof Date ? validated.updatedAt : new Date(validated.updatedAt)) : undefined;
    }

    /**
     * Aceita camelCase ou snake_case
     * @param {Object} obj
     * @returns {Professor}
     */
    static fromObj(obj) {
        return new Professor(obj);
    }
}

