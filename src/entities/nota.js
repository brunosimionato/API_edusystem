import { z } from 'zod';

const novaNotaSchema = z.object({
    idAluno: z.number().int().positive(),
    idDisciplina: z.number().int().positive(),
    idTurma: z.number().int().positive(),
    trimestre: z.number().int().min(1).max(4),
    nota: z.number().min(0).max(10),
    anoLetivo: z.number().int().min(2000).max(2100)
});

const notaSchema = z.object({
    id: z.number().int().positive(),
    idAluno: z.number().int().positive(),
    idDisciplina: z.number().int().positive(),
    idTurma: z.number().int().positive(),
    trimestre: z.number().int().min(1).max(4),
    nota: z.number().min(0).max(10),
    anoLetivo: z.number().int().min(2000).max(2100),

    alunoNome: z.string().optional(),
    disciplinaNome: z.string().optional(),
    turmaNome: z.string().optional(),
    createdAt: z.date().or(z.string()).optional(),
    updatedAt: z.date().or(z.string()).optional()
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
    }

    toJSON() {
        return {
            idAluno: this.idAluno,
            idDisciplina: this.idDisciplina,
            idTurma: this.idTurma,
            trimestre: this.trimestre,
            nota: this.nota,
            anoLetivo: this.anoLetivo
        };
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
        this.alunoNome = validated.alunoNome;
        this.disciplinaNome = validated.disciplinaNome;
        this.turmaNome = validated.turmaNome;
        this.createdAt = validated.createdAt ? new Date(validated.createdAt) : undefined;
        this.updatedAt = validated.updatedAt ? new Date(validated.updatedAt) : undefined;
    }

    static fromObj(obj) {
        return new Nota({
            id: obj.id_notas || obj.id,
            idAluno: obj.id_aluno || obj.idAluno,
            idDisciplina: obj.id_disciplina || obj.idDisciplina,
            idTurma: obj.id_turma || obj.idTurma,
            trimestre: obj.trimestre,
            nota: typeof obj.nota === 'string' ? parseFloat(obj.nota) : obj.nota,
            anoLetivo: obj.ano_letivo || obj.anoLetivo,
            alunoNome: obj.aluno_nome || obj.alunoNome,
            disciplinaNome: obj.disciplina_nome || obj.disciplinaNome,
            turmaNome: obj.turma_nome || obj.turmaNome,
            createdAt: obj.created_at || obj.createdAt,
            updatedAt: obj.updated_at || obj.updatedAt
        });
    }

    toJSON() {
        return {
            id: this.id,
            idAluno: this.idAluno,
            alunoNome: this.alunoNome,
            idDisciplina: this.idDisciplina,
            disciplinaNome: this.disciplinaNome,
            idTurma: this.idTurma,
            turmaNome: this.turmaNome,
            trimestre: this.trimestre,
            nota: this.nota,
            anoLetivo: this.anoLetivo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    getSituacao() {
        if (this.nota >= 7) return 'Aprovado';
        if (this.nota >= 5) return 'Recuperação';
        return 'Reprovado';
    }

    isAprovado() {
        return this.nota >= 7;
    }

    isRecuperacao() {
        return this.nota >= 5 && this.nota < 7;
    }

    isReprovado() {
        return this.nota < 5;
    }
}