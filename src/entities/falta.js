// src/entities/falta.js - NOVO
import { z } from 'zod';

const novaFaltaSchema = z.object({
    idAluno: z.number(),
    idTurma: z.number(),
    data: z.string(), // ISO string
    periodo: z.number().min(1).max(5).optional(),
    justificada: z.boolean().default(false),
    observacao: z.string().optional()
});

const faltaSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idTurma: z.number(),
    data: z.date(),
    periodo: z.number().nullable(),
    justificada: z.boolean(),
    observacao: z.string().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export class NovaFalta {
    constructor(obj) {
        const validated = novaFaltaSchema.parse(obj);
        this.idAluno = validated.idAluno;
        this.idTurma = validated.idTurma;
        this.data = new Date(validated.data);
        this.periodo = validated.periodo || null;
        this.justificada = validated.justificada;
        this.observacao = validated.observacao || null;
    }
}

export class Falta {
    constructor(obj) {
        const validated = faltaSchema.parse(obj);
        this.id = validated.id;
        this.idAluno = validated.idAluno;
        this.idTurma = validated.idTurma;
        this.data = validated.data;
        this.periodo = validated.periodo;
        this.justificada = validated.justificada;
        this.observacao = validated.observacao;
        this.createdAt = validated.createdAt;
        this.updatedAt = validated.updatedAt;
    }
}