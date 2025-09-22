import { it, describe, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';

import { NovaTurma, Turma } from '../src/entities/turma.js';
import { TurmaService } from '../src/services/turma.service.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

describe('Turma Service', async () => {
    let db; // pg client
    let turmaService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        turmaService = new TurmaService(db);
        await db.query('TRUNCATE TABLE turmas RESTART IDENTITY CASCADE');
    });

    afterEach(async () => { await db.release(); });
    after(async () => { await cleanup(); });

    it('should create a new turma', async () => {
        const nova = NovaTurma.fromObj({ nome: 'Turma A', anoEscolar: 2024, quantidadeMaxima: 30, turno: 'Manhã', serie: '5A' });
        const turma = await turmaService.create(nova);
        assert.ok(turma instanceof Turma);
        assert.strictEqual(turma.nome, 'Turma A');
        assert.strictEqual(turma.anoEscolar, 2024);
        assert.strictEqual(turma.quantidadeMaxima, 30);
        assert.strictEqual(turma.turno, 'Manhã');
        assert.strictEqual(turma.serie, '5A');
    });

    it('should list turmas', async () => {
        await turmaService.create(NovaTurma.fromObj({ nome: 'Turma A', anoEscolar: 2024, quantidadeMaxima: 30, turno: 'Manhã', serie: '5A' }));
        await turmaService.create(NovaTurma.fromObj({ nome: 'Turma B', anoEscolar: 2024, quantidadeMaxima: 25, turno: 'Tarde', serie: '5B' }));
        const turmas = await turmaService.list();
        assert.ok(Array.isArray(turmas));
        assert.strictEqual(turmas.length, 2);
        assert.ok(turmas.every(t => t instanceof Turma));
        assert.ok(turmas.some(t => t.turno === 'Manhã'));
        assert.ok(turmas.some(t => t.turno === 'Tarde'));
    });

    it('should get by id', async () => {
        const created = await turmaService.create(NovaTurma.fromObj({ nome: 'Turma X', anoEscolar: 2024, quantidadeMaxima: 20, turno: 'Noite', serie: '4X' }));
        const turma = await turmaService.getById(created.id);
        assert.ok(turma instanceof Turma);
        assert.strictEqual(turma.id, created.id);
        assert.strictEqual(turma.turno, 'Noite');
    });

    it('should return null for missing turma', async () => {
        const turma = await turmaService.getById(9999);
        assert.strictEqual(turma, null);
    });

    it('should update turma', async () => {
        const created = await turmaService.create(NovaTurma.fromObj({ nome: 'Turma Old', anoEscolar: 2024, quantidadeMaxima: 20, turno: 'Manhã', serie: '6O' }));
        const updated = await turmaService.update(created.id, NovaTurma.fromObj({ nome: 'Turma New', anoEscolar: 2025, quantidadeMaxima: 35, turno: 'Tarde', serie: '6N' }));
        assert.ok(updated instanceof Turma);
        assert.strictEqual(updated.nome, 'Turma New');
        assert.strictEqual(updated.anoEscolar, 2025);
        assert.strictEqual(updated.quantidadeMaxima, 35);
        assert.strictEqual(updated.turno, 'Tarde');
        assert.strictEqual(updated.serie, '6N');
        const fetched = await turmaService.getById(created.id);
        assert.strictEqual(fetched.turno, 'Tarde');
    });

    it('should throw updating missing turma', async () => {
        await assert.rejects(() => turmaService.update(9999, NovaTurma.fromObj({ nome: 'X', anoEscolar: 2024, quantidadeMaxima: 10, turno: 'Noite', serie: 'X' })), /Turma não encontrada/);
    });

    it('should delete turma', async () => {
        const created = await turmaService.create(NovaTurma.fromObj({ nome: 'Turma Z', anoEscolar: 2024, quantidadeMaxima: 18, turno: 'Manhã', serie: '4Z' }));
        await turmaService.delete(created.id);
        const gone = await turmaService.getById(created.id);
        assert.strictEqual(gone, null);
    });

    it('should throw deleting missing', async () => {
        await assert.rejects(() => turmaService.delete(9999), /Turma não encontrada/);
    });
});