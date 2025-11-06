// src/entities/horario.js - NOVO
import { z } from 'zod';

const novoHorarioSchema = z.object({
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number().min(1).max(5), // 1=Segunda, 5=Sexta
    periodo: z.number().min(1).max(5), // 1-5 períodos
    sala: z.string().optional()
});

const horarioSchema = z.object({
    id: z.number(),
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number(),
    periodo: z.number(),
    sala: z.string().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export class NovoHorario {
    constructor(obj) {
        const validated = novoHorarioSchema.parse(obj);
        this.idTurma = validated.idTurma;
        this.idProfessor = validated.idProfessor;
        this.idDisciplina = validated.idDisciplina;
        this.diaSemana = validated.diaSemana;
        this.periodo = validated.periodo;
        this.sala = validated.sala || null;
    }
}

export class Horario {
    constructor(obj) {
        const validated = horarioSchema.parse(obj);
        this.id = validated.id;
        this.idTurma = validated.idTurma;
        this.idProfessor = validated.idProfessor;
        this.idDisciplina = validated.idDisciplina;
        this.diaSemana = validated.diaSemana;
        this.periodo = validated.periodo;
        this.sala = validated.sala;
        this.createdAt = validated.createdAt;
        this.updatedAt = validated.updatedAt;
    }
}