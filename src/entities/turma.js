import { z } from 'zod';

// Added turno field (string) and kept camelCase for the others
const novaTurmaSchema = z.object({
    nome: z.string(),
    anoEscolar: z.number().int(),
    quantidadeMaxima: z.number().int(),
    turno: z.string(),
    serie: z.string()
});

const turmaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    anoEscolar: z.number().int(),
    quantidadeMaxima: z.number().int(),
    turno: z.string(),
    serie: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class NovaTurma {
    // { nome, anoEscolar, quantidadeMaxima, turno, serie }
    constructor(obj) {
        const validated = novaTurmaSchema.parse(obj);
        this.nome = validated.nome;
        this.anoEscolar = validated.anoEscolar;
        this.quantidadeMaxima = validated.quantidadeMaxima;
        this.turno = validated.turno;
        this.serie = validated.serie;
    }
    static fromObj(obj) { return new NovaTurma(obj); }
}

export class Turma {
    // { id, nome, anoEscolar, quantidadeMaxima, turno, serie, createdAt?, updatedAt? }
    constructor(obj) {
        const validated = turmaSchema.parse(obj);
        this.id = validated.id;
        this.nome = validated.nome;
        this.anoEscolar = validated.anoEscolar;
        this.quantidadeMaxima = validated.quantidadeMaxima;
        this.turno = validated.turno;
        this.serie = validated.serie;
        this.createdAt = validated.createdAt ? (validated.createdAt instanceof Date ? validated.createdAt : new Date(validated.createdAt)) : undefined;
        this.updatedAt = validated.updatedAt ? (validated.updatedAt instanceof Date ? validated.updatedAt : new Date(validated.updatedAt)) : undefined;
    }
    static fromObj(obj) { return new Turma(obj); }
}