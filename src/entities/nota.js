// src/entities/nota.js - NOVO
import { z } from 'zod';

const novaNotaSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number(),
    idTurma: z.number(),
    trimestre: z.number().min(1).max(3),
    nota: z.number().min(0).max(100),
    anoLetivo: z.number().int(),
    tipo: z.enum(['bimestral', 'recuperacao', 'final']).default('bimestral')
});

const notaSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number(),
    idTurma: z.number(),
    trimestre: z.number(),
    nota: z.number(),
    anoLetivo: z.number(),
    tipo: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export class NovaNota {
    constructor(obj) {
        const validated = novaNotaSchema.parse(obj);
        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina;
        this.idTurma = validated.idTurma;
        this.trimestre = validated.trimestre;
        this.nota = validated.nota;
        this.anoLetivo = validated.anoLetivo;
        this.tipo = validated.tipo;
    }
}

export class Nota {
    constructor(obj) {
        const validated = notaSchema.parse(obj);
        this.id = validated.id;
        this.idAluno = validated.idAluno;
        this.idDisciplina = validated.idDisciplina;
        this.idTurma = validated.idTurma;
        this.trimestre = validated.trimestre;
        this.nota = validated.nota;
        this.anoLetivo = validated.anoLetivo;
        this.tipo = validated.tipo;
        this.createdAt = validated.createdAt;
        this.updatedAt = validated.updatedAt;
    }
}