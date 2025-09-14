import { z } from 'zod';

const novaDisciplinaSchema = z.object({
    nome: z.string()
});

const disciplinaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class NovaDisciplina {
    /**
     * @param {{
     *   nome: string
     * }} obj
     */
    constructor(obj) {
        const validated = novaDisciplinaSchema.parse(obj);
        this.nome = validated.nome;
    }

    /**
     * @param {Object} obj
     * @returns {NovaDisciplina}
     */
    static fromObj(obj) {
        return new NovaDisciplina(obj);
    }
}

export class Disciplina {
    /**
     * @param {{
     *   id: number,
     *   nome: string,
     *   createdAt?: Date|string,
     *   updatedAt?: Date|string
     * }} obj
     */
    constructor(obj) {
        const validated = disciplinaSchema.parse(obj);
        this.id = validated.id;
        this.nome = validated.nome;
        this.createdAt = validated.createdAt ? (validated.createdAt instanceof Date ? validated.createdAt : new Date(validated.createdAt)) : undefined;
        this.updatedAt = validated.updatedAt ? (validated.updatedAt instanceof Date ? validated.updatedAt : new Date(validated.updatedAt)) : undefined;
    }

    /**
     * @param {Object} obj
     * @returns {Disciplina}
     */
    static fromObj(obj) {
        return new Disciplina(obj);
    }
}