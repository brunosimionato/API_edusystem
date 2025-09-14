import { it, describe, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { NovoUsuario, Usuario } from '../src/entities/usuario.js';
import { NovoAluno, Aluno } from '../src/entities/aluno.js';
import { UsuarioService } from '../src/services/usuario.service.js';
import { AlunoService } from '../src/services/aluno.service.js';
import { HashingService } from '../src/services/hashing.service.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

describe('Aluno Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {UsuarioService} */
    let usuarioService;
    /** @type {AlunoService} */
    let alunoService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        usuarioService = new UsuarioService(db, new HashingService('testsecret'));
        alunoService = new AlunoService(db, usuarioService);
        await db.query("TRUNCATE TABLE alunos RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    it('should create a new aluno', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Test',
            senha: 'senha',
            email: 'aluno@test.com',
            tipo_usuario: 'aluno',
        });
        const novoAluno = NovoAluno.fromObj({
            usuario: novoUsuario,
            data_nascimento: '2010-05-10',
            responsavel_nome: 'Responsável Teste',
            nome_pai: 'Pai Teste',
            nome_mae: 'Mãe Teste',
            profissao_pai: 'Engenheiro',
            profissao_mae: 'Professora',
            alergias: 'Nenhuma',
            telefone_pai: '11999999999',
            telefone_mae: '11888888888',
            email_pai: 'pai@test.com',
            email_mae: 'mae@test.com',
            idade: 13,
            religiao: 'Católica'
        });

        const aluno = await alunoService.create(novoAluno);

        assert.ok(aluno instanceof Aluno);
        assert.ok(aluno.usuario instanceof Usuario);
        assert.strictEqual(aluno.usuario.nome, 'Aluno Test');
        assert.strictEqual(aluno.usuario.email, 'aluno@test.com');
        assert.strictEqual(aluno.usuario.tipo_usuario, 'aluno');
        assert.strictEqual(aluno.responsavel_nome, 'Responsável Teste');
        assert.strictEqual(aluno.nome_pai, 'Pai Teste');
        assert.strictEqual(aluno.nome_mae, 'Mãe Teste');
        assert.strictEqual(aluno.profissao_pai, 'Engenheiro');
        assert.strictEqual(aluno.profissao_mae, 'Professora');
        assert.strictEqual(aluno.alergias, 'Nenhuma');
        assert.strictEqual(aluno.telefone_pai, '11999999999');
        assert.strictEqual(aluno.telefone_mae, '11888888888');
        assert.strictEqual(aluno.email_pai, 'pai@test.com');
        assert.strictEqual(aluno.email_mae, 'mae@test.com');
        assert.strictEqual(aluno.idade, 13);
        assert.strictEqual(aluno.religiao, 'Católica');
        assert.ok(aluno.data_nascimento.match(/^\d{4}-\d{2}-\d{2}$/));
        assert.strictEqual(aluno.data_nascimento, '2010-05-10');
    });

    it('should create an aluno with only required fields', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Vazio',
            senha: 'senha',
            email: 'aluno.vazio@test.com',
            tipo_usuario: 'aluno',
        });
        const novoAluno = NovoAluno.fromObj({
            usuario: novoUsuario
            // All other fields omitted (should default to null)
        });

        const aluno = await alunoService.create(novoAluno);

        assert.ok(aluno instanceof Aluno);
        assert.ok(aluno.usuario instanceof Usuario);
        assert.strictEqual(aluno.usuario.nome, 'Aluno Vazio');
        assert.strictEqual(aluno.usuario.email, 'aluno.vazio@test.com');
        assert.strictEqual(aluno.usuario.tipo_usuario, 'aluno');
        assert.strictEqual(aluno.data_nascimento, null);
        assert.strictEqual(aluno.responsavel_nome, null);
        assert.strictEqual(aluno.nome_pai, null);
        assert.strictEqual(aluno.nome_mae, null);
        assert.strictEqual(aluno.profissao_pai, null);
        assert.strictEqual(aluno.profissao_mae, null);
        assert.strictEqual(aluno.alergias, null);
        assert.strictEqual(aluno.telefone_pai, null);
        assert.strictEqual(aluno.telefone_mae, null);
        assert.strictEqual(aluno.email_pai, null);
        assert.strictEqual(aluno.email_mae, null);
        assert.strictEqual(aluno.idade, null);
        assert.strictEqual(aluno.religiao, null);
    });

    it('should get an aluno by ID', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Get',
            senha: 'senha',
            email: 'aluno.get@test.com',
            tipo_usuario: 'aluno',
        });
        const novoAluno = NovoAluno.fromObj({
            usuario: novoUsuario,
            data_nascimento: '2012-01-02',
            responsavel_nome: 'Responsável Get',
            nome_pai: 'Pai Get',
            nome_mae: 'Mãe Get',
            profissao_pai: 'Médico',
            profissao_mae: 'Advogada',
            alergias: 'Nenhuma',
            telefone_pai: '11999999999',
            telefone_mae: '11888888888',
            email_pai: 'pai.get@test.com',
            email_mae: 'mae.get@test.com',
            idade: 11,
            religiao: 'Evangélica'
        });

        const createdAluno = await alunoService.create(novoAluno);

        const aluno = await alunoService.getById(createdAluno.id);

        assert.ok(aluno instanceof Aluno);
        assert.ok(aluno.usuario instanceof Usuario);
        assert.strictEqual(aluno.usuario.nome, 'Aluno Get');
        assert.strictEqual(aluno.usuario.email, 'aluno.get@test.com');
        assert.strictEqual(aluno.usuario.tipo_usuario, 'aluno');
        assert.strictEqual(aluno.data_nascimento, '2012-01-02');
        assert.strictEqual(aluno.responsavel_nome, 'Responsável Get');
        assert.strictEqual(aluno.nome_pai, 'Pai Get');
        assert.strictEqual(aluno.nome_mae, 'Mãe Get');
        assert.strictEqual(aluno.profissao_pai, 'Médico');
        assert.strictEqual(aluno.profissao_mae, 'Advogada');
        assert.strictEqual(aluno.alergias, 'Nenhuma');
        assert.strictEqual(aluno.telefone_pai, '11999999999');
        assert.strictEqual(aluno.telefone_mae, '11888888888');
        assert.strictEqual(aluno.email_pai, 'pai.get@test.com');
        assert.strictEqual(aluno.email_mae, 'mae.get@test.com');
        assert.strictEqual(aluno.idade, 11);
        assert.strictEqual(aluno.religiao, 'Evangélica');
    });

    it('should return null when getting a non-existent aluno', async () => {
        const aluno = await alunoService.getById(9999);
        assert.strictEqual(aluno, null);
    });

    it('should list all alunos', async () => {
        const novoUsuario1 = NovoUsuario.fromObj({
            nome: 'Aluno One',
            senha: 'senha1',
            email: 'aluno1@test.com',
            tipo_usuario: 'aluno',
        });
        const novoUsuario2 = NovoUsuario.fromObj({
            nome: 'Aluno Two',
            senha: 'senha2',
            email: 'aluno2@test.com',
            tipo_usuario: 'aluno',
        });
        await alunoService.create(NovoAluno.fromObj({ usuario: novoUsuario1, data_nascimento: '2011-01-01' }));
        await alunoService.create(NovoAluno.fromObj({ usuario: novoUsuario2, data_nascimento: '2012-02-02' }));

        const alunos = await alunoService.list();

        assert.ok(Array.isArray(alunos));
        assert.strictEqual(alunos.length, 2);
        assert.ok(alunos.some(a => a.usuario.nome === 'Aluno One' && a.data_nascimento === '2011-01-01'));
        assert.ok(alunos.some(a => a.usuario.nome === 'Aluno Two' && a.data_nascimento === '2012-02-02'));
        assert.ok(alunos.every(a => a instanceof Aluno));
        assert.ok(alunos.every(a => a.usuario instanceof Usuario));
    });

    it('should update an aluno', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Update',
            senha: 'senha',
            email: 'aluno.update@test.com',
            tipo_usuario: 'aluno',
        });
        const createdAluno = await alunoService.create(NovoAluno.fromObj({
            usuario: novoUsuario,
            data_nascimento: '2010-01-01',
            responsavel_nome: 'Resp',
            nome_pai: 'Pai',
            nome_mae: 'Mae',
            profissao_pai: 'Prof',
            profissao_mae: 'Prof',
            alergias: 'Nenhuma',
            telefone_pai: '111',
            telefone_mae: '222',
            email_pai: 'pai@x.com',
            email_mae: 'mae@x.com',
            idade: 10,
            religiao: 'Católica'
        }));

        const updatedUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Atualizado',
            senha: 'nova_senha',
            email: 'aluno.atualizado@test.com',
            tipo_usuario: 'aluno',
        });
        const updatedAluno = await alunoService.update(createdAluno.id, NovoAluno.fromObj({
            usuario: updatedUsuario,
            data_nascimento: '2011-12-31',
            responsavel_nome: 'Novo Resp',
            nome_pai: 'Novo Pai',
            nome_mae: 'Nova Mae',
            profissao_pai: 'Novo Prof',
            profissao_mae: 'Nova Prof',
            alergias: 'Alergia',
            telefone_pai: '333',
            telefone_mae: '444',
            email_pai: 'pai2@x.com',
            email_mae: 'mae2@x.com',
            idade: 11,
            religiao: 'Evangélica'
        }));

        assert.ok(updatedAluno instanceof Aluno);
        assert.strictEqual(updatedAluno.usuario.nome, 'Aluno Atualizado');
        assert.strictEqual(updatedAluno.usuario.email, 'aluno.atualizado@test.com');
        assert.strictEqual(updatedAluno.data_nascimento, '2011-12-31');
        assert.strictEqual(updatedAluno.responsavel_nome, 'Novo Resp');
        assert.strictEqual(updatedAluno.nome_pai, 'Novo Pai');
        assert.strictEqual(updatedAluno.nome_mae, 'Nova Mae');
        assert.strictEqual(updatedAluno.profissao_pai, 'Novo Prof');
        assert.strictEqual(updatedAluno.profissao_mae, 'Nova Prof');
        assert.strictEqual(updatedAluno.alergias, 'Alergia');
        assert.strictEqual(updatedAluno.telefone_pai, '333');
        assert.strictEqual(updatedAluno.telefone_mae, '444');
        assert.strictEqual(updatedAluno.email_pai, 'pai2@x.com');
        assert.strictEqual(updatedAluno.email_mae, 'mae2@x.com');
        assert.strictEqual(updatedAluno.idade, 11);
        assert.strictEqual(updatedAluno.religiao, 'Evangélica');
    });

    it('should delete an aluno', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno Delete',
            senha: 'senha',
            email: 'aluno.delete@test.com',
            tipo_usuario: 'aluno',
        });
        const createdAluno = await alunoService.create(NovoAluno.fromObj({
            usuario: novoUsuario,
            data_nascimento: '2010-01-01'
        }));

        await alunoService.delete(createdAluno.id);

        const deletedAluno = await alunoService.getById(createdAluno.id);
        assert.strictEqual(deletedAluno, null);
    });

    it('should get an aluno by usuario_id', async () => {
        const novoUsuario = NovoUsuario.fromObj({
            nome: 'Aluno ByUser',
            senha: 'senha',
            email: 'aluno.byuser@test.com',
            tipo_usuario: 'aluno',
        });
        const novoAluno = NovoAluno.fromObj({
            usuario: novoUsuario,
            data_nascimento: '2015-03-15'
        });

        const u2 = await usuarioService.create({
            email: 'u2@test.com',
            nome: 'U2',
            senha: 'senha',
            tipo_usuario: 'aluno'
        });

        const u3 = await usuarioService.create({
            email: 'u3@test.com',
            nome: 'U3',
            senha: 'senha',
            tipo_usuario: 'aluno'
        });

        const createdAluno = await alunoService.create(novoAluno);

        const aluno = await alunoService.getByUsuarioId(createdAluno.usuario.id);

        assert.ok(aluno instanceof Aluno);
        assert.strictEqual(aluno.usuario.nome, 'Aluno ByUser');
        assert.strictEqual(aluno.usuario.email, 'aluno.byuser@test.com');
        assert.strictEqual(aluno.data_nascimento, '2015-03-15');
    });

    it('should return null when getting an aluno by non-existent usuario_id', async () => {
        const aluno = await alunoService.getByUsuarioId(9999);
        assert.strictEqual(aluno, null);
    });
});
