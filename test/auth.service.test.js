import { decode } from 'jsonwebtoken'
import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert/strict';

import { AuthService } from '../src/services/auth.service.js';
import { UsuarioService } from '../src/services/usuario.service.js';
import { HashingService } from '../src/services/hashing.service.js';
import { AlunoService } from '../src/services/aluno.service.js';
import { ProfessorService } from '../src/services/professor.service.js';
import { SecretariaService } from '../src/services/secretaria.service.js';

import { NovoUsuario } from '../src/entities/usuario.js';
import { NovoAluno } from '../src/entities/aluno.js';
import { NovoProfessor } from '../src/entities/professor.js';
import { NovoSecretaria } from '../src/entities/secretaria.js';
import { LoginCredentials } from '../src/entities/auth.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

const jwtSecret = 'testsecret';

describe('AuthService', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {UsuarioService} */
    let usuarioService;
    /** @type {HashingService} */
    let hashingService;
    /** @type {AlunoService} */
    let alunoService;
    /** @type {ProfessorService} */
    let professorService;
    /** @type {SecretariaService} */
    let secretariaService;
    /** @type {AuthService} */
    let authService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        // Clean all tables
        await db.query("TRUNCATE TABLE alunos RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE professores RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE secretaria RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");

        hashingService = new HashingService(jwtSecret);
        usuarioService = new UsuarioService(db, hashingService);
        alunoService = new AlunoService(db, usuarioService);
        professorService = new ProfessorService(db, usuarioService);
        secretariaService = new SecretariaService(db, usuarioService);
        authService = new AuthService(db, usuarioService, hashingService, alunoService, professorService, secretariaService);
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    it('should throw for non-existent user', async () => {
        const credentials = new LoginCredentials('notfound@email.com', 'pass', 'aluno');
        await assert.rejects(() => authService.login(credentials), /Usuário não encontrado/);
    });

    it('should throw for wrong password', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno',
            senha: 'senha',
            email: 'aluno@a.com',
            tipo_usuario: 'aluno'
        });
        const novoAluno = NovoAluno.fromObj({ usuario: novoUsuario });
        await alunoService.create(novoAluno);

        const credentials = new LoginCredentials('aluno@a.com', 'wrong', 'aluno');
        await assert.rejects(() => authService.login(credentials), /Credenciais inválidas/);
    });

    it('should throw if entity not found for user', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Professor',
            senha: 'senha',
            email: 'professor@a.com',
            tipo_usuario: 'professor'
        });
        await usuarioService.create(novoUsuario); // Only create user, not professor entity

        const credentials = new LoginCredentials('professor@a.com', 'senha', 'professor');
        await assert.rejects(() => authService.login(credentials), /Entidade não encontrada para este usuário/);
    });

    it('should not expose hash_senha in JWT for aluno', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno',
            senha: 'senha',
            email: 'aluno@a.com',
            tipo_usuario: 'aluno'
        });
        const novoAluno = NovoAluno.fromObj({ usuario: novoUsuario });
        const aluno = await alunoService.create(novoAluno);

        const credentials = LoginCredentials.fromObj({
            email: 'aluno@a.com',
            password: 'senha',
        });
        const token = await authService.login(credentials);
        const decoded = decode(token);
        assert.ok(!decoded.entity.hash_senha);
        assert.ok(!decoded.usuario.hash_senha);
    });

    it('should not expose hash_senha in JWT for professor', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Professor',
            senha: 'senha',
            email: 'professor@a.com',
            tipo_usuario: 'professor'
        });
        const novoProfessor = NovoProfessor.fromObj({
            usuario: novoUsuario,
            disciplina_especialidade: 'Matemática'
        });
        const professor = await professorService.create(novoProfessor);

        const credentials = new LoginCredentials('professor@a.com', 'senha', 'professor');
        const token = await authService.login(credentials);
        const decoded = await import('jsonwebtoken').then(j => j.default.verify(token, jwtSecret));
        assert.ok(!decoded.entity.hash_senha);
        assert.ok(!decoded.usuario.hash_senha);
    });

    it('should not expose hash_senha in JWT for secretaria', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Secretaria',
            senha: 'senha',
            email: 'secretaria@a.com',
            tipo_usuario: 'secretaria'
        });
        const novoSecretaria = NovoSecretaria.fromObj({ usuario: novoUsuario });
        const secretaria = await secretariaService.create(novoSecretaria);

        const credentials = new LoginCredentials('secretaria@a.com', 'senha', 'secretaria');
        const token = await authService.login(credentials);
        const decoded = await import('jsonwebtoken').then(j => j.default.verify(token, jwtSecret));
        assert.ok(!decoded.entity.hash_senha);
        assert.ok(!decoded.usuario.hash_senha);
    });
});
