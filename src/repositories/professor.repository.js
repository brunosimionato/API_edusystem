import { NovoProfessor, Professor } from '../entities/professor.js';

export class ProfessorRepository {
    constructor(db) {
        this.db = db;
    }

    // LISTA
    async list() {
        const res = await this.db.query(`
        SELECT p.* 
        FROM professores p
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuarios
        WHERE u.ativo = true
    `);

        return res.rows.map(row =>
            Professor.fromObj({
                id: row.id_professores,
                idUsuario: row.id_usuario,
                idDisciplinaEspecialidade: row.id_disciplina_especialidade,
                telefone: row.telefone,
                genero: row.genero,
                cpf: row.cpf,
                nascimento: row.nascimento,
                logradouro: row.logradouro,
                numero: row.numero,
                bairro: row.bairro,
                cep: row.cep,
                cidade: row.cidade,
                estado: row.estado,
                formacaoAcademica: row.formacao_academica,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            })
        );
    }

    // GET BY ID
    async getById(id) {
        const res = await this.db.query(
            `SELECT * FROM professores WHERE id_professores = $1`,
            [id]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];

        return Professor.fromObj({
            id: row.id_professores,
            idUsuario: row.id_usuario,
            idDisciplinaEspecialidade: row.id_disciplina_especialidade,
            telefone: row.telefone,
            genero: row.genero,
            cpf: row.cpf,
            nascimento: row.nascimento,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            formacaoAcademica: row.formacao_academica,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }


    // GET BY ID USUÁRIO
    async getByUsuarioId(usuarioId) {

        const res = await this.db.query(
            `SELECT * FROM professores WHERE id_usuario = $1`,
            [usuarioId]
        );

        if (res.rows.length === 0) {
            return null;
        }

        const row = res.rows[0];

        return Professor.fromObj({
            id: row.id_professores,
            idUsuario: row.id_usuario,
            idDisciplinaEspecialidade: row.id_disciplina_especialidade,
            telefone: row.telefone,
            genero: row.genero,
            cpf: row.cpf,
            nascimento: row.nascimento,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            formacaoAcademica: row.formacao_academica,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    // CREATE
    async create(novoProfessor) {
        const res = await this.db.query(
            `INSERT INTO professores (
                id_usuario,
                id_disciplina_especialidade,
                telefone,
                genero,
                cpf,
                nascimento,
                logradouro,
                numero,
                bairro,
                cep,
                cidade,
                estado,
                formacao_academica
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *`,
            [
                novoProfessor.idUsuario,
                novoProfessor.idDisciplinaEspecialidade,
                novoProfessor.telefone,
                novoProfessor.genero,
                novoProfessor.cpf,
                novoProfessor.nascimento,
                novoProfessor.logradouro,
                novoProfessor.numero,
                novoProfessor.bairro,
                novoProfessor.cep,
                novoProfessor.cidade,
                novoProfessor.estado,
                novoProfessor.formacaoAcademica
            ]
        );

        const row = res.rows[0];

        return Professor.fromObj({
            id: row.id_professores,
            idUsuario: row.id_usuario,
            idDisciplinaEspecialidade: row.id_disciplina_especialidade,
            telefone: row.telefone,
            genero: row.genero,
            cpf: row.cpf,
            nascimento: row.nascimento,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            formacaoAcademica: row.formacao_academica,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }


    // UPDATE
    async update(id, data) {
        const res = await this.db.query(
            `UPDATE professores SET 
                id_disciplina_especialidade = $1,
                telefone = $2,
                genero = $3,
                cpf = $4,
                nascimento = $5,
                logradouro = $6,
                numero = $7,
                bairro = $8,
                cep = $9,
                cidade = $10,
                estado = $11,
                formacao_academica = $12,
                updated_at = NOW()
            WHERE id_professores = $13
            RETURNING *`,
            [
                data.idDisciplinaEspecialidade,
                data.telefone,
                data.genero,
                data.cpf,
                data.nascimento,
                data.logradouro,
                data.numero,
                data.bairro,
                data.cep,
                data.cidade,
                data.estado,
                data.formacaoAcademica,
                id
            ]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];

        return Professor.fromObj({
            id: row.id_professores,
            idUsuario: row.id_usuario,
            idDisciplinaEspecialidade: row.id_disciplina_especialidade,
            telefone: row.telefone,
            genero: row.genero,
            cpf: row.cpf,
            nascimento: row.nascimento,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            formacaoAcademica: row.formacao_academica,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }


    // DISCIPLINAS
    async getProfessorDisciplinas(idProfessor) {
        const res = await this.db.query(
            `SELECT d.id_disciplinas AS id, d.nome
             FROM professores_disciplinas pd
             JOIN disciplinas d ON d.id_disciplinas = pd.id_disciplina
             WHERE pd.id_professor = $1`,
            [idProfessor]
        );
        return res.rows;
    }

    async saveProfessorDisciplinas(idProfessor, idsDisciplinas) {
        await this.db.query(
            `DELETE FROM professores_disciplinas WHERE id_professor = $1`,
            [idProfessor]
        );

        for (const idDisc of idsDisciplinas) {
            await this.db.query(
                `INSERT INTO professores_disciplinas (id_professor, id_disciplina)
                 VALUES ($1, $2)`,
                [idProfessor, idDisc]
            );
        }
    }


    // TURMAS
    async getProfessorTurmas(idProfessor) {
        const res = await this.db.query(
            `SELECT t.id_turmas AS id, t.nome
             FROM professores_turmas pt
             JOIN turmas t ON t.id_turmas = pt.id_turma
             WHERE pt.id_professor = $1`,
            [idProfessor]
        );
        return res.rows;
    }

    async saveProfessorTurmas(idProfessor, idsTurmas) {
        await this.db.query(
            `DELETE FROM professores_turmas WHERE id_professor = $1`,
            [idProfessor]
        );

        for (const idTurma of idsTurmas) {
            await this.db.query(
                `INSERT INTO professores_turmas (id_professor, id_turma)
                 VALUES ($1, $2)`,
                [idProfessor, idTurma]
            );
        }
    }
}
