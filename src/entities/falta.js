import { z } from 'zod';


const novaFaltaSchema = z.object({
    idAluno: z.number().int().positive('ID do aluno deve ser um número positivo'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    periodo: z.number().min(1).max(5).optional().nullable()
});

const faltaSchema = z.object({
    id: z.number().int().positive(),
    idAluno: z.number().int().positive(),
    data: z.date(),
    periodo: z.number().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export class NovaFalta {
    constructor(obj) {
        const validated = novaFaltaSchema.parse(obj);
        this.idAluno = validated.idAluno;
        this.data = new Date(validated.data);
        this.periodo = validated.periodo || null;

        if (this.data > new Date()) {
            throw new Error('Não é possível registrar falta para data futura');
        }
    }


    toController() {
        return {
            idAluno: this.idAluno,
            data: this.data.toISOString().split('T')[0],
            periodo: this.periodo
        };
    }
}

export class Falta {
    constructor(obj) {
        const validated = faltaSchema.parse(obj);
        this.id = validated.id;
        this.idAluno = validated.idAluno;
        this.data = validated.data;
        this.periodo = validated.periodo;
        this.createdAt = validated.createdAt;
        this.updatedAt = validated.updatedAt;
    }

    static fromController(obj) {
        return new Falta({
            id: obj.id,
            idAluno: obj.idAluno,
            data: new Date(obj.data),
            periodo: obj.periodo,
            createdAt: obj.createdAt ? new Date(obj.createdAt) : undefined,
            updatedAt: obj.updatedAt ? new Date(obj.updatedAt) : undefined
        });
    }

    toJSON() {
        return {
            id: this.id,
            idAluno: this.idAluno,
            data: this.data.toISOString().split('T')[0],
            periodo: this.periodo,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString()
        };
    }
}