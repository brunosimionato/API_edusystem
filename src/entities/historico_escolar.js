import { z } from 'zod';

const novoHistoricoEscolarSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number().nullable().optional(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number(),
    anoConclusao: z.number().int()
});

const historicoEscolarSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number().nullable().optional(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number(),
    anoConclusao: z.number().int().nullable(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class NovoHistoricoEscolar {
    /**
     * @param {{
     *   idAluno: number,
     *   idDisciplina?: number|null,
     *   nomeEscola: string,
     *   serieConcluida: string,
     *   nota: number,
     *   anoConclusao: number
     * }} obj
     */
    constructor(obj) {
        const validated = novoHistoricoEscolarSchema.parse({
            ...obj,
            idAluno: obj.idAluno,
            idDisciplina: obj.idDisciplina,
            nomeEscola: obj.nomeEscola,
            serieConcluida: obj.serieConcluida,
            anoConclusao: obj.anoConclusao,
        });

        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina ?? null;
        this.nomeEscola = validated.nomeEscola;
        this.serieConcluida = validated.serieConcluida;
        this.nota = validated.nota;
        this.anoConclusao = validated.anoConclusao ?? null;
    }

    /**
     * @param {Object} obj
     * @returns {NovoHistoricoEscolar}
     */
    static fromObj(obj) {
        return new NovoHistoricoEscolar(obj);
    }
}

export class HistoricoEscolar {
    /**
     * @param {{
     *   id: number,
     *   idAluno: number,
     *   idDisciplina?: number|null,
     *   nomeEscola: string,
     *   serieConcluida: string,
     *   nota: number,
     *   anoConclusao: number,
     *   createdAt?: Date|string,
     *   updatedAt?: Date|string
     * }} obj
     */
    constructor(obj) {
        const validated = historicoEscolarSchema.parse({
            ...obj,
            id: obj.id,
            idAluno: obj.idAluno,
            idDisciplina: obj.idDisciplina,
            nomeEscola: obj.nomeEscola,
            serieConcluida: obj.serieConcluida,
            anoConclusao: obj.anoConclusao,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
        });

        this.id = validated.id;
        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina ?? null;
        this.nomeEscola = validated.nomeEscola;
        this.serieConcluida = validated.serieConcluida;
        this.nota = validated.nota;
        this.anoConclusao = validated.anoConclusao
        this.createdAt = validated.createdAt ? (validated.createdAt instanceof Date ? validated.createdAt : new Date(validated.createdAt)) : undefined;
        this.updatedAt = validated.updatedAt ? (validated.updatedAt instanceof Date ? validated.updatedAt : new Date(validated.updatedAt)) : undefined;
    }

    /**
     * @param {Object} obj
     * @returns {HistoricoEscolar}
     */
    static fromObj(obj) {
        return new HistoricoEscolar(obj);
    }
}