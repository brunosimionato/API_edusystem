import { it, describe, before, after, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import { NovoUsuario, Usuario } from '../src/entities/usuario.js'
import { NovoProfessor, Professor } from '../src/entities/professor.js'
import { NovaDisciplina, Disciplina } from '../src/entities/disciplina.js'
import { HashingService } from '../src/services/hashing.service.js'
import { UsuarioService } from '../src/services/usuario.service.js'
import { DisciplinaService } from '../src/services/disciplina.service.js'
import { ProfessorService } from '../src/services/professor.service.js'

import { get_db, cleanup } from '../src/db/index.js'
import { migrate } from '../src/db/migrate.js'
import { env } from 'node:process'

describe('Professor Service', async () => {
    /** @type {import('pg').Client} */
    let db;
    /** @type {HashingService} */
    let hashingService;
    /** @type {UsuarioService} */
    let usuarioService;
    /** @type {DisciplinaService} */
    let disciplinaService;
    /** @type {ProfessorService} */
    let professorService;

    beforeEach(async () => {
        db = await get_db();
        await migrate(db);
        hashingService = new HashingService(env.JWT_SECRET);
        usuarioService = new UsuarioService(db, hashingService);
        disciplinaService = new DisciplinaService(db);
        professorService = new ProfessorService(db, usuarioService, disciplinaService);
        await db.query("TRUNCATE TABLE professores RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE");
        await db.query("TRUNCATE TABLE disciplinas RESTART IDENTITY CASCADE");
    });

    afterEach(async () => {
        await db.release();
    });

    after(async () => {
        await cleanup();
    });

    async function createProfessor({ nome, disciplina }) {
        // Create usuario first
        const novoUsuario = NovoUsuario.fromObj({
            nome: nome,
            senha: 'senha',
            email: nome.replace(' ', '.').toLowerCase() + '@test.com',
            tipo_usuario: 'professor',
        });
        const usuario = await usuarioService.create(novoUsuario);

        // Create disciplina first
        const novaDisciplina = NovaDisciplina.fromObj({
            nome: disciplina
        });
        const disciplinaObj = await disciplinaService.create(novaDisciplina);

        // Create professor with IDs
        const novoProfessor = NovoProfessor.fromObj({
            idUsuario: usuario.id,
            idDisciplinaEspecialidade: disciplinaObj.id,
            telefone: '123456789',
            genero: 'Masculino',
            cpf: '123.456.789-00',
            nascimento: new Date('1990-01-01'),
            logradouro: 'Rua Teste',
            numero: '123',
            bairro: 'Bairro Teste',
            cep: '12345-678',
            cidade: 'Cidade Teste',
            estado: 'SP',
            formacaoAcademica: 'Mestrado em Educação'
        });

        return professorService.create(novoProfessor);
    }

    it('should create a new professor', async () => {
        const professor = await createProfessor({
            nome: 'Professor Test',
            disciplina: 'Matemática'
        });

        assert.ok(professor instanceof Professor);
        assert.strictEqual(typeof professor.idUsuario, 'number');
        assert.strictEqual(typeof professor.idDisciplinaEspecialidade, 'number');
        assert.strictEqual(professor.telefone, '123456789');
        assert.strictEqual(professor.formacaoAcademica, 'Mestrado em Educação');
    });

    it('should list all professors', async () => {
        const professor1 = await createProfessor({
            nome: 'Professor One',
            disciplina: 'Matemática'
        });

        const professor2 = await createProfessor({
            nome: 'Professor Two',
            disciplina: 'Física'
        });

        const professores = await professorService.list();

        assert.ok(Array.isArray(professores));
        assert.strictEqual(professores.length, 2);
        assert.ok(professores.every(p => p instanceof Professor));
        assert.ok(professores.every(p => typeof p.idUsuario === 'number'));
        assert.ok(professores.every(p => typeof p.idDisciplinaEspecialidade === 'number'));
    });

    it('should get a professor by ID', async () => {
        const novoProfessor = await createProfessor({
            nome: 'Professor Get',
            disciplina: 'Química'
        });

        const professor = await professorService.getById(novoProfessor.id);

        assert.ok(professor instanceof Professor);
        assert.strictEqual(professor.id, novoProfessor.id);
        assert.strictEqual(professor.idUsuario, novoProfessor.idUsuario);
        assert.strictEqual(professor.idDisciplinaEspecialidade, novoProfessor.idDisciplinaEspecialidade);
        assert.strictEqual(professor.telefone, '123456789');
    });

    it('should return null when getting a non-existent professor', async () => {
        const professor = await professorService.getById(9999);
        assert.strictEqual(professor, null);
    });

    it('should delete a professor', async () => {
        const novoProfessor = await createProfessor({
            nome: 'Professor Delete',
            disciplina: 'Matemática'
        });

        await professorService.delete(novoProfessor.id);

        const deletedProfessor = await professorService.getById(novoProfessor.id);
        assert.strictEqual(deletedProfessor, null);
    });

    it('should update a professor', { only: true }, async () => {
        const novoProfessor = await createProfessor({
            nome: 'Professor Update',
            disciplina: 'Biologia'
        });

        const updatedProfessor = await professorService.update(novoProfessor.id, {
            idUsuario: novoProfessor.idUsuario,
            idDisciplinaEspecialidade: novoProfessor.idDisciplinaEspecialidade,
            telefone: '99999999',
            genero: 'Feminino',
            cpf: '987.654.321-00',
            nascimento: '1985-05-15',
            logradouro: 'Rua Atualizada',
            numero: '456',
            bairro: 'Bairro Atualizado',
            cep: '54321-876',
            cidade: 'Cidade Atualizada',
            estado: 'AM',
            formacaoAcademica: 'Doutorado em Biologia'
        });

        assert.ok(updatedProfessor instanceof Professor);
        assert.strictEqual(updatedProfessor.id, novoProfessor.id);
        assert.strictEqual(updatedProfessor.idUsuario, novoProfessor.idUsuario);
        assert.strictEqual(updatedProfessor.idDisciplinaEspecialidade, novoProfessor.idDisciplinaEspecialidade);
        assert.strictEqual(updatedProfessor.telefone, '99999999');
        assert.strictEqual(updatedProfessor.genero, 'Feminino');
        assert.strictEqual(updatedProfessor.cpf, '987.654.321-00');
        assert.strictEqual(updatedProfessor.logradouro, 'Rua Atualizada');
        assert.strictEqual(updatedProfessor.numero, '456');
        assert.strictEqual(updatedProfessor.bairro, 'Bairro Atualizado');
        assert.strictEqual(updatedProfessor.cep, '54321-876');
        assert.strictEqual(updatedProfessor.cidade, 'Cidade Atualizada');
        assert.strictEqual(updatedProfessor.estado, 'AM');
        assert.strictEqual(updatedProfessor.formacaoAcademica, 'Doutorado em Biologia');
    });
});
