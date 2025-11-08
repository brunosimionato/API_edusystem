import { z } from 'zod';

const novoHistoricoEscolarSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number().nullable().optional(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number().nullable().optional(),
    anoConclusao: z.coerce.number().int()
});

const historicoEscolarSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number().nullable().optional(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number().nullable().optional(),
    anoConclusao: z.coerce.number().int().nullable(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export class NovoHistoricoEscolar {
    constructor(obj) {
        const validated = novoHistoricoEscolarSchema.parse({
            idAluno: obj.idAluno,
            idDisciplina: obj.idDisciplina ?? null,
            nomeEscola: obj.nomeEscola ?? obj.escolaAnterior,      // ✅ fallback
            serieConcluida: obj.serieConcluida ?? obj.serieAnterior, // ✅ fallback
            nota: obj.nota,
            anoConclusao: obj.anoConclusao
        });

        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina;
        this.nomeEscola = validated.nomeEscola;
        this.serieConcluida = validated.serieConcluida;
        this.nota = validated.nota;
        this.anoConclusao = validated.anoConclusao;
    }

    static fromObj(obj) {
        return new NovoHistoricoEscolar(obj);
    }
}

export class HistoricoEscolar {
    constructor(obj) {
        const validated = historicoEscolarSchema.parse(obj);

        this.id = validated.id;
        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina;
        this.nomeEscola = validated.nomeEscola;
        this.serieConcluida = validated.serieConcluida;
        this.nota = validated.nota;
        this.anoConclusao = validated.anoConclusao
        this.createdAt = validated.createdAt ? new Date(validated.createdAt) : undefined;
        this.updatedAt = validated.updatedAt ? new Date(validated.updatedAt) : undefined;
    }

    static fromObj(obj) {
        return new HistoricoEscolar(obj);
    }
}
