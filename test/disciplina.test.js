import { it, describe, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';

import { NovaDisciplina, Disciplina } from '../src/entities/disciplina.js';
import { DisciplinaService } from '../src/services/disciplina.service.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

describe('Disciplina Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {DisciplinaService} */
    let disciplinaService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        disciplinaService = new DisciplinaService(db);
        await db.query("TRUNCATE TABLE disciplinas RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    it('should create a new disciplina', async () => {
        const novoDisciplina = NovaDisciplina.fromObj({ nome: 'Matemática' });
        const disciplina = await disciplinaService.create(novoDisciplina);

        assert.ok(disciplina instanceof Disciplina);
        assert.strictEqual(disciplina.nome, 'Matemática');
        assert.ok(typeof disciplina.id === 'number');
    });

    it('should list all Disciplinas', async () => {
        await disciplinaService.create(NovaDisciplina.fromObj({ nome: 'Matemática' }));
        await disciplinaService.create(NovaDisciplina.fromObj({ nome: 'Física' }));

        const disciplinas = await disciplinaService.list();

        assert.ok(Array.isArray(disciplinas));
        assert.strictEqual(disciplinas.length, 2);
        assert.ok(disciplinas.some(m => m.nome === 'Matemática'));
        assert.ok(disciplinas.some(m => m.nome === 'Física'));
        assert.ok(disciplinas.every(m => m instanceof Disciplina));
    });

    it('should get a disciplina by ID', async () => {
        const created = await disciplinaService.create(NovaDisciplina.fromObj({ nome: 'Química' }));
        const disciplina = await disciplinaService.getById(created.id);

        assert.ok(disciplina instanceof Disciplina);
        assert.strictEqual(disciplina.nome, 'Química');
        assert.strictEqual(disciplina.id, created.id);
    });

    it('should return null when getting a non-existent disciplina', async () => {
        const disciplina = await disciplinaService.getById(9999);
        assert.strictEqual(disciplina, null);
    });

    it('should update a disciplina', async () => {
        const created = await disciplinaService.create(NovaDisciplina.fromObj({ nome: 'Biologia' }));
        const updated = await disciplinaService.update(created.id, NovaDisciplina.fromObj({ nome: 'Geografia' }));

        assert.ok(updated instanceof Disciplina);
        assert.strictEqual(updated.nome, 'Geografia');
        assert.strictEqual(updated.id, created.id);

        // Confirm update in DB
        const fetched = await disciplinaService.getById(created.id);
        assert.strictEqual(fetched.nome, 'Geografia');
    });

    it('should throw when updating a non-existent disciplina', async () => {
        await assert.rejects(
            () => disciplinaService.update(9999, NovaDisciplina.fromObj({ nome: 'Filosofia' })),
            /Disciplina não encontrada/
        );
    });

    it('should delete a disciplina', async () => {
        const created = await disciplinaService.create(NovaDisciplina.fromObj({ nome: 'Artes' }));
        await disciplinaService.delete(created.id);

        const deleted = await disciplinaService.getById(created.id);
        assert.strictEqual(deleted, null);
    });

    it('should throw when deleting a non-existent disciplina', async () => {
        await assert.rejects(
            () => disciplinaService.delete(9999),
            /Disciplina não encontrada/
        );
    });

    it('should handle empty list', async () => {
        const disciplinas = await disciplinaService.list();
        assert.ok(Array.isArray(disciplinas));
        assert.strictEqual(disciplinas.length, 0);
    });
});
