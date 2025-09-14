import { it, describe, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { NovoUsuario, Usuario } from '../src/entities/usuario.js';
import { NovoSecretaria, Secretaria } from '../src/entities/secretaria.js';
import { HashingService } from '../src/services/hashing.service.js'
import { UsuarioService } from '../src/services/usuario.service.js';
import { SecretariaService } from '../src/services/secretaria.service.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

describe('Secretaria Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {HashingService} */
    let hashingService;
    /** @type {UsuarioService} */
    let usuarioService;
    /** @type {SecretariaService} */
    let secretariaService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        hashingService = new HashingService("super secret jwt secret");
        usuarioService = new UsuarioService(db, hashingService);
        secretariaService = new SecretariaService(db, usuarioService);
        await db.query("TRUNCATE TABLE secretarias RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    it('should create a new secretaria', async () => {
        const novoUsuario = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria Test',
            senha: 'senha',
            email: 'secretaria@test.com',
            tipo_usuario: 'secretaria',
        }));

        const novoSecretaria = NovoSecretaria.fromObj({
            idUsuario: novoUsuario.id
        });

        const secretaria = await secretariaService.create(novoSecretaria);

        assert.ok(secretaria instanceof Secretaria);
        assert.strictEqual(secretaria.idUsuario, novoUsuario.id);
    });

    it('should list all secretarias', async () => {
        const novoUsuario1 = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria One',
            senha: 'senha1',
            email: 'secretaria1@test.com',
            tipo_usuario: 'secretaria',
        }));
        const novoUsuario2 = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria Two',
            senha: 'senha2',
            email: 'secretaria2@test.com',
            tipo_usuario: 'secretaria',
        }));
        await secretariaService.create(NovoSecretaria.fromObj({ idUsuario: novoUsuario1.id }));
        await secretariaService.create(NovoSecretaria.fromObj({ idUsuario: novoUsuario2.id }));

        const secretarias = await secretariaService.list();

        assert.ok(Array.isArray(secretarias));
        assert.strictEqual(secretarias.length, 2);
        assert.ok(secretarias.some(s => s.idUsuario === novoUsuario1.id));
        assert.ok(secretarias.some(s => s.idUsuario === novoUsuario2.id));
        assert.ok(secretarias.every(s => s instanceof Secretaria));
    });

    it('should get a secretaria by ID', async () => {
        const novoUsuario = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria Get',
            senha: 'senha',
            email: 'secretaria.get@test.com',
            tipo_usuario: 'secretaria',
        }));
        const createdSecretaria = await secretariaService.create(NovoSecretaria.fromObj({ idUsuario: novoUsuario.id }));

        const secretaria = await secretariaService.getById(createdSecretaria.id);

        assert.ok(secretaria instanceof Secretaria);
        assert.strictEqual(secretaria.idUsuario, novoUsuario.id);
    });

    it('should return null when getting a non-existent secretaria', async () => {
        const secretaria = await secretariaService.getById(9999);
        assert.strictEqual(secretaria, null);
    });

    it('should delete a secretaria', async () => {
        const novoUsuario = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria Delete',
            senha: 'senha',
            email: 'secretaria.delete@test.com',
            tipo_usuario: 'secretaria',
        }));
        const createdSecretaria = await secretariaService.create(NovoSecretaria.fromObj({ idUsuario: novoUsuario.id }));

        await secretariaService.delete(createdSecretaria.id);

        const deletedSecretaria = await secretariaService.getById(createdSecretaria.id);
        assert.strictEqual(deletedSecretaria, null);
    });

    it('should get a secretaria by usuario_id', async () => {
        const novoUsuario = await usuarioService.create(NovoUsuario.fromObj({
            nome: 'Secretaria ByUser',
            senha: 'senha',
            email: 'secretaria.byuser@test.com',
            tipo_usuario: 'secretaria',
        }));
        const novoSecretaria = NovoSecretaria.fromObj({
            idUsuario: novoUsuario.id
        });

        const createdSecretaria = await secretariaService.create(novoSecretaria);

        const secretaria = await secretariaService.getByUsuarioId(createdSecretaria.idUsuario);

        assert.ok(secretaria instanceof Secretaria);
        assert.strictEqual(secretaria.idUsuario, novoUsuario.id);
    });

    it('should return null when getting a secretaria by non-existent usuario_id', async () => {
        const secretaria = await secretariaService.getByUsuarioId(9999);
        assert.strictEqual(secretaria, null);
    });
});
