import { it, describe, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { NovoAluno, Aluno } from '../src/entities/aluno.js';
import { AlunoService } from '../src/services/aluno.service.js';
import { AlunoRepository } from '../src/repositories/aluno.repository.js';

import { get_db, cleanup } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

describe('Aluno Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {AlunoService} */
    let alunoService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        const alunoRepository = new AlunoRepository(db);
        alunoService = new AlunoService(db, alunoRepository);
        await db.query("TRUNCATE TABLE alunos RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    it('should create a new aluno', async () => {
        const novoAluno = NovoAluno.fromObj({
            nome: 'João Silva',
            cns: '123456789012345',
            nascimento: '2010-05-10',
            genero: 'Masculino',
            religiao: 'Católica',
            telefone: '11999999999',
            logradouro: 'Rua das Flores, 123',
            numero: '123',
            bairro: 'Centro',
            cep: '01234-567',
            cidade: 'São Paulo',
            estado: 'SP',
            responsavel1Nome: 'Maria Silva',
            responsavel1Cpf: '12345678901',
            responsavel1Telefone: '11888888888',
            responsavel1Parentesco: 'Mãe',
            responsavel2Nome: 'José Silva',
            responsavel2Cpf: '10987654321',
            responsavel2Telefone: '11777777777',
            responsavel2Parentesco: 'Pai'
        });

        const aluno = await alunoService.create(novoAluno);

        assert.ok(aluno instanceof Aluno);
        assert.strictEqual(aluno.nome, 'João Silva');
        assert.strictEqual(aluno.cns, '123456789012345');
        assert.strictEqual(aluno.genero, 'Masculino');
        assert.strictEqual(aluno.religiao, 'Católica');
        assert.strictEqual(aluno.telefone, '11999999999');
        assert.strictEqual(aluno.logradouro, 'Rua das Flores, 123');
        assert.strictEqual(aluno.numero, '123');
        assert.strictEqual(aluno.bairro, 'Centro');
        assert.strictEqual(aluno.cep, '01234-567');
        assert.strictEqual(aluno.cidade, 'São Paulo');
        assert.strictEqual(aluno.estado, 'SP');
        assert.strictEqual(aluno.responsavel1Nome, 'Maria Silva');
        assert.strictEqual(aluno.responsavel1Cpf, '12345678901');
        assert.strictEqual(aluno.responsavel1Telefone, '11888888888');
        assert.strictEqual(aluno.responsavel1Parentesco, 'Mãe');
        assert.strictEqual(aluno.responsavel2Nome, 'José Silva');
        assert.strictEqual(aluno.responsavel2Cpf, '10987654321');
        assert.strictEqual(aluno.responsavel2Telefone, '11777777777');
        assert.strictEqual(aluno.responsavel2Parentesco, 'Pai');
        assert.ok(aluno.nascimento instanceof Date);
    });

    it('should create an aluno with only required fields', async () => {
        const novoAluno = NovoAluno.fromObj({
            nome: 'Ana Santos',
            cns: '987654321012345',
            nascimento: '2011-03-15',
            genero: 'Feminino',
            telefone: '11555555555',
            logradouro: 'Av. Principal',
            numero: '456',
            bairro: 'Vila Nova',
            cep: '54321-098',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            responsavel1Nome: 'Carlos Santos',
            responsavel1Cpf: '55544433322',
            responsavel1Telefone: '11444444444',
            responsavel1Parentesco: 'Pai'
        });

        const aluno = await alunoService.create(novoAluno);

        assert.ok(aluno instanceof Aluno);
        assert.strictEqual(aluno.nome, 'Ana Santos');
        assert.strictEqual(aluno.cns, '987654321012345');
        assert.strictEqual(aluno.genero, 'Feminino');
        assert.strictEqual(aluno.religiao, null);
        assert.strictEqual(aluno.responsavel2Nome, null);
        assert.strictEqual(aluno.responsavel2Cpf, null);
        assert.strictEqual(aluno.responsavel2Telefone, null);
        assert.strictEqual(aluno.responsavel2Parentesco, null);
    });

    it('should get an aluno by ID', async () => {
        const novoAluno = NovoAluno.fromObj({
            nome: 'Aluno Get',
            cns: '111222333444555',
            nascimento: '2012-01-02',
            genero: 'Masculino',
            religiao: 'Evangélica',
            telefone: '11999999999',
            logradouro: 'Rua Get',
            numero: '10',
            bairro: 'Bairro Get',
            cep: '12345-678',
            cidade: 'Cidade Get',
            estado: 'SP',
            responsavel1Nome: 'Responsável Get',
            responsavel1Cpf: '11111111111',
            responsavel1Telefone: '11888888888',
            responsavel1Parentesco: 'Pai'
        });

        const createdAluno = await alunoService.create(novoAluno);

        const aluno = await alunoService.getById(createdAluno.id);

        assert.ok(aluno instanceof Aluno);
        assert.strictEqual(aluno.nome, 'Aluno Get');
        assert.strictEqual(aluno.cns, '111222333444555');
        assert.strictEqual(aluno.genero, 'Masculino');
        assert.strictEqual(aluno.religiao, 'Evangélica');
        assert.strictEqual(aluno.telefone, '11999999999');
        assert.strictEqual(aluno.logradouro, 'Rua Get');
        assert.strictEqual(aluno.numero, '10');
        assert.strictEqual(aluno.bairro, 'Bairro Get');
        assert.strictEqual(aluno.cep, '12345-678');
        assert.strictEqual(aluno.cidade, 'Cidade Get');
        assert.strictEqual(aluno.estado, 'SP');
        assert.strictEqual(aluno.responsavel1Nome, 'Responsável Get');
        assert.strictEqual(aluno.responsavel1Cpf, '11111111111');
        assert.strictEqual(aluno.responsavel1Telefone, '11888888888');
        assert.strictEqual(aluno.responsavel1Parentesco, 'Pai');
    });

    it('should return null when getting a non-existent aluno', async () => {
        const aluno = await alunoService.getById(9999);
        assert.strictEqual(aluno, null);
    });

    it('should list all alunos', async () => {
        const novoAluno1 = NovoAluno.fromObj({
            nome: 'Aluno One',
            cns: '111111111111111',
            nascimento: '2011-01-01',
            genero: 'Masculino',
            telefone: '11111111111',
            logradouro: 'Rua 1',
            numero: '1',
            bairro: 'Bairro 1',
            cep: '11111-111',
            cidade: 'Cidade 1',
            estado: 'SP',
            responsavel1Nome: 'Resp 1',
            responsavel1Cpf: '11111111111',
            responsavel1Telefone: '11111111111',
            responsavel1Parentesco: 'Pai'
        });
        const novoAluno2 = NovoAluno.fromObj({
            nome: 'Aluno Two',
            cns: '222222222222222',
            nascimento: '2012-02-02',
            genero: 'Feminino',
            telefone: '22222222222',
            logradouro: 'Rua 2',
            numero: '2',
            bairro: 'Bairro 2',
            cep: '22222-222',
            cidade: 'Cidade 2',
            estado: 'RJ',
            responsavel1Nome: 'Resp 2',
            responsavel1Cpf: '22222222222',
            responsavel1Telefone: '22222222222',
            responsavel1Parentesco: 'Mãe'
        });
        await alunoService.create(novoAluno1);
        await alunoService.create(novoAluno2);

        const alunos = await alunoService.list();

        assert.ok(Array.isArray(alunos));
        assert.strictEqual(alunos.length, 2);
        assert.ok(alunos.some(a => a.nome === 'Aluno One' && a.cns === '111111111111111'));
        assert.ok(alunos.some(a => a.nome === 'Aluno Two' && a.cns === '222222222222222'));
        assert.ok(alunos.every(a => a instanceof Aluno));
    });

    it('should update an aluno', async () => {
        const createdAluno = await alunoService.create(NovoAluno.fromObj({
            nome: 'Aluno Update',
            cns: '123456789012345',
            nascimento: '2010-01-01',
            genero: 'Masculino',
            telefone: '11111111111',
            logradouro: 'Rua Original',
            numero: '1',
            bairro: 'Bairro Original',
            cep: '11111-111',
            cidade: 'Cidade Original',
            estado: 'SP',
            responsavel1Nome: 'Resp Original',
            responsavel1Cpf: '11111111111',
            responsavel1Telefone: '11111111111',
            responsavel1Parentesco: 'Pai',
            religiao: 'Católica'
        }));

        const updatedAluno = await alunoService.update(createdAluno.id, {
            nome: 'Aluno Atualizado',
            cns: '987654321098765',
            nascimento: '2011-12-31',
            genero: 'Feminino',
            telefone: '22222222222',
            logradouro: 'Rua Atualizada',
            numero: '2',
            bairro: 'Bairro Atualizado',
            cep: '22222-222',
            cidade: 'Cidade Atualizada',
            estado: 'RJ',
            responsavel1Nome: 'Novo Resp',
            responsavel1Cpf: '22222222222',
            responsavel1Telefone: '22222222222',
            responsavel1Parentesco: 'Mãe',
            religiao: 'Evangélica'
        });

        assert.ok(updatedAluno instanceof Aluno);
        assert.strictEqual(updatedAluno.nome, 'Aluno Atualizado');
        assert.strictEqual(updatedAluno.cns, '987654321098765');
        assert.strictEqual(updatedAluno.genero, 'Feminino');
        assert.strictEqual(updatedAluno.telefone, '22222222222');
        assert.strictEqual(updatedAluno.logradouro, 'Rua Atualizada');
        assert.strictEqual(updatedAluno.numero, '2');
        assert.strictEqual(updatedAluno.bairro, 'Bairro Atualizado');
        assert.strictEqual(updatedAluno.cep, '22222-222');
        assert.strictEqual(updatedAluno.cidade, 'Cidade Atualizada');
        assert.strictEqual(updatedAluno.estado, 'RJ');
        assert.strictEqual(updatedAluno.responsavel1Nome, 'Novo Resp');
        assert.strictEqual(updatedAluno.responsavel1Cpf, '22222222222');
        assert.strictEqual(updatedAluno.responsavel1Telefone, '22222222222');
        assert.strictEqual(updatedAluno.responsavel1Parentesco, 'Mãe');
        assert.strictEqual(updatedAluno.religiao, 'Evangélica');
    });

    it('should delete an aluno', async () => {
        const createdAluno = await alunoService.create(NovoAluno.fromObj({
            nome: 'Aluno Delete',
            cns: '123456789012345',
            nascimento: '2010-01-01',
            genero: 'Masculino',
            telefone: '11111111111',
            logradouro: 'Rua Delete',
            numero: '1',
            bairro: 'Bairro Delete',
            cep: '11111-111',
            cidade: 'Cidade Delete',
            estado: 'SP',
            responsavel1Nome: 'Resp Delete',
            responsavel1Cpf: '11111111111',
            responsavel1Telefone: '11111111111',
            responsavel1Parentesco: 'Pai'
        }));

        await alunoService.delete(createdAluno.id);

        const deletedAluno = await alunoService.getById(createdAluno.id);
        assert.strictEqual(deletedAluno, null);
    });
});