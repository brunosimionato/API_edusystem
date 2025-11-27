import { z } from 'zod';

export const novoHorarioSchema = z.object({
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number().min(1).max(5),
    periodo: z.number().min(1).max(5),
    sala: z.string().optional()
});

export const horarioSchema = z.object({
    id: z.number(),
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number(),
    periodo: z.number(),
    sala: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

    turma: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),

    disciplina: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),

    professor: z.object({
        id: z.number(),
        usuario: z.object({
            nome: z.string()
        })
    }).optional()
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

    toObject() {
        return {
            idTurma: this.idTurma,
            idProfessor: this.idProfessor,
            idDisciplina: this.idDisciplina,
            diaSemana: this.diaSemana,
            periodo: this.periodo,
            sala: this.sala
        };
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

        this.turma = validated.turma;
        this.disciplina = validated.disciplina;
        this.professor = validated.professor;
    }

    static fromObject(obj) {
        return new Horario(obj);
    }

    toObject() {
        return {
            id: this.id,
            idTurma: this.idTurma,
            idProfessor: this.idProfessor,
            idDisciplina: this.idDisciplina,
            diaSemana: this.diaSemana,
            periodo: this.periodo,
            sala: this.sala,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            turma: this.turma,
            disciplina: this.disciplina,
            professor: this.professor
        };
    }
}

export const createNovoHorario = (obj) => {
    return novoHorarioSchema.parse(obj);
};

export const createHorario = (obj) => {
    return horarioSchema.parse(obj);
};