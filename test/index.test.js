import { it, describe, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import { NovoUsuario, Usuario } from '../src/entities/usuario.js'
import { UsuarioService } from '../src/services/usuario.service.js'
import { get_db, cleanup } from '../src/db/index.js'
import { migrate } from '../src/db/migrate.js'

describe('Usuario Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {UsuarioService} */
    let usuarioService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        usuarioService = new UsuarioService(db);
        await db.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    })

    after(async () => {
        await cleanup();
    })

    it('should create a new user', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Test User',
            senha: 'senha',
            email: 'test@example.com',
            tipo_usuario: 'professor'
        });
        
        const usuarioCriado = await usuarioService.create(novoUsuario);

        assert.ok(usuarioCriado instanceof Usuario);
        assert.strictEqual(usuarioCriado.id, 1);
        assert.strictEqual(usuarioCriado.nome, 'Test User');
        assert.strictEqual(usuarioCriado.email, 'test@example.com');
        assert.notStrictEqual(usuarioCriado.hash_senha, 'senha');
    })

    it('should list all users', async () => {
        const user1 = NovoUsuario.fromObj({
            nome: 'User One',
            senha: 'senha1',
            email: 'userone@example.com',
            tipo_usuario: 'professor'
        });
        const user2 = NovoUsuario.fromObj({
            nome: 'User Two',
            senha: 'senha2',
            email: 'usertwo@example.com',
            tipo_usuario: 'aluno'
        });
        await usuarioService.create(user1);
        await usuarioService.create(user2);

        const usuarios = await usuarioService.list();
        assert.ok(Array.isArray(usuarios));
        assert.strictEqual(usuarios.length, 2);
        assert.ok(usuarios.some(u => u.nome === 'User One' && u.email === 'userone@example.com'));
        assert.ok(usuarios.some(u => u.nome === 'User Two' && u.email === 'usertwo@example.com'));
        assert.ok(usuarios[0] instanceof Usuario);
        assert.ok(usuarios[1] instanceof Usuario);
    })

    it('should get a user by email', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Email User',
            senha: 'senha',
            email: 'email@example.com',
            tipo_usuario: 'professor'
        });
        await usuarioService.create(novoUsuario);

        const usuario = await usuarioService.getByEmail('email@example.com');
        assert.ok(usuario instanceof Usuario);
        assert.strictEqual(usuario.nome, 'Email User');
        assert.strictEqual(usuario.email, 'email@example.com');
    })

    it('should return null if user not found by email', async () => {
        const usuario = await usuarioService.getByEmail('notfound@example.com');
        assert.strictEqual(usuario, null);
    })

    it('should create and update a user', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Update User',
            senha: 'senha',
            email: 'update@example.com',
            tipo_usuario: 'professor'
        });
        const usuarioCriado = await usuarioService.create(novoUsuario);

        const updatedUsuario = NovoUsuario.fromObj({
            id: usuarioCriado.id,
            nome: 'Updated Name',
            email: 'updated@example.com',
            senha: 'nova senha',
            tipo_usuario: usuarioCriado.tipo_usuario
        });
        const usuarioAtualizado = await usuarioService.update(usuarioCriado.id, updatedUsuario);
        assert.strictEqual(usuarioAtualizado.nome, 'Updated Name');
        assert.strictEqual(usuarioAtualizado.email, 'updated@example.com');
        assert.strictEqual(usuarioAtualizado.id, usuarioCriado.id);
    });

    it('should create and delete a user', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Delete User',
            senha: 'senha',
            email: 'delete@example.com',
            tipo_usuario: 'professor'
        });
        const usuarioCriado = await usuarioService.create(novoUsuario);

        await usuarioService.delete(usuarioCriado.id);
        const usuarios = await usuarioService.list();
        assert.ok(!usuarios.some(u => u.id === usuarioCriado.id));
    });
})