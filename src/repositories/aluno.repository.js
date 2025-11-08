import { NovoAluno, Aluno } from '../entities/aluno.js';

export class AlunoRepository {
    constructor(db) {
        this.db = db;
    }

    async list() {
        const res = await this.db.query(`SELECT * FROM alunos`);
        return res.rows.map(row => new Aluno({
            id: row.id_alunos,
            nome: row.nome,
            cpf: row.cpf,
            cns: row.cns,
            nascimento: row.nascimento,
            genero: row.genero,
            religiao: row.religiao,
            telefone: row.telefone,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            responsavel1Nome: row.responsavel1_nome,
            responsavel1Cpf: row.responsavel1_cpf,
            responsavel1Telefone: row.responsavel1_telefone,
            responsavel1Parentesco: row.responsavel1_parentesco,
            responsavel2Nome: row.responsavel2_nome,
            responsavel2Cpf: row.responsavel2_cpf,
            responsavel2Telefone: row.responsavel2_telefone,
            responsavel2Parentesco: row.responsavel2_parentesco,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    }

    async getById(id) {
        const res = await this.db.query(
            `SELECT * FROM alunos WHERE id_alunos = $1`,
            [id]
        );

        if (res.rows.length === 0) return null;

        const row = res.rows[0];
return new Aluno({
    id: row.id_alunos,
    nome: row.nome,
    cpf: row.cpf,
    cns: row.cns,
    nascimento: row.nascimento,
    genero: row.genero,
    religiao: row.religiao,
    telefone: row.telefone,
    logradouro: row.logradouro,
    numero: row.numero,
    bairro: row.bairro,
    cep: row.cep,
    cidade: row.cidade,
    estado: row.estado,
    responsavel1Nome: row.responsavel1_nome,
    responsavel1Cpf: row.responsavel1_cpf,
    responsavel1Telefone: row.responsavel1_telefone,
    responsavel1Parentesco: row.responsavel1_parentesco,
    responsavel2Nome: row.responsavel2_nome,
    responsavel2Cpf: row.responsavel2_cpf,
    responsavel2Telefone: row.responsavel2_telefone,
    responsavel2Parentesco: row.responsavel2_parentesco,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});
    }

async create(novoAluno, client = this.db) {
    try {
        const res = await client.query(
            `INSERT INTO alunos (
                nome,
                cpf,
                cns,
                nascimento,
                genero,
                religiao,
                telefone,
                logradouro,
                numero,
                bairro,
                cep,
                cidade,
                estado,
                responsavel1_nome,
                responsavel1_cpf,
                responsavel1_telefone,
                responsavel1_parentesco,
                responsavel2_nome,
                responsavel2_cpf,
                responsavel2_telefone,
                responsavel2_parentesco
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING *`,
            [
                novoAluno.nome,
                novoAluno.cpf,
                novoAluno.cns,
                novoAluno.nascimento,
                novoAluno.genero,
                novoAluno.religiao,
                novoAluno.telefone,
                novoAluno.logradouro,
                novoAluno.numero,
                novoAluno.bairro,
                novoAluno.cep,
                novoAluno.cidade,
                novoAluno.estado,
                novoAluno.responsavel1Nome,
                novoAluno.responsavel1Cpf,
                novoAluno.responsavel1Telefone,
                novoAluno.responsavel1Parentesco,
                novoAluno.responsavel2Nome,
                novoAluno.responsavel2Cpf,
                novoAluno.responsavel2Telefone,
                novoAluno.responsavel2Parentesco
            ]
        );

        const row = res.rows[0];

        return new Aluno({
            id: row.id_alunos,
            nome: row.nome,
            cpf: row.cpf,
            cns: row.cns,
            nascimento: row.nascimento,
            genero: row.genero,
            religiao: row.religiao,
            telefone: row.telefone,
            logradouro: row.logradouro,
            numero: row.numero,
            bairro: row.bairro,
            cep: row.cep,
            cidade: row.cidade,
            estado: row.estado,
            responsavel1Nome: row.responsavel1_nome,
            responsavel1Cpf: row.responsavel1_cpf,
            responsavel1Telefone: row.responsavel1_telefone,
            responsavel1Parentesco: row.responsavel1_parentesco,
            responsavel2Nome: row.responsavel2_nome,
            responsavel2Cpf: row.responsavel2_cpf,
            responsavel2Telefone: row.responsavel2_telefone,
            responsavel2Parentesco: row.responsavel2_parentesco,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });

    } catch (error) {
        // ⚠️ ERRO DE CPF DUPLICADO
        if (error.code === "23505") {
            throw new Error("CPF já cadastrado no sistema.");
        }

        throw error; // erros não relacionados continuam sendo lançados
    }
}



    async update(id, updateData) {
        const res = await this.db.query(
            `UPDATE alunos SET 
                nome = $1,
                cpf = $2,
                cns = $3,
                nascimento = $4,
                genero = $5,
                religiao = $6,
                telefone = $7,
                logradouro = $8,
                numero = $9,
                bairro = $10,
                cep = $11,
                cidade = $12,
                estado = $13,
                responsavel1_nome = $14,
                responsavel1_cpf = $15,
                responsavel1_telefone = $16,
                responsavel1_parentesco = $17,
                responsavel2_nome = $18,
                responsavel2_cpf = $19,
                responsavel2_telefone = $20,
                responsavel2_parentesco = $21,
                updated_at = NOW()
            WHERE id_alunos = $22
            RETURNING *`,
            [
                updateData.nome,
                updateData.cpf,
                updateData.cns,
                updateData.nascimento,
                updateData.genero,
                updateData.religiao,
                updateData.telefone,
                updateData.logradouro,
                updateData.numero,
                updateData.bairro,
                updateData.cep,
                updateData.cidade,
                updateData.estado,
                updateData.responsavel1Nome,
                updateData.responsavel1Cpf,
                updateData.responsavel1Telefone,
                updateData.responsavel1Parentesco,
                updateData.responsavel2Nome,
                updateData.responsavel2Cpf,
                updateData.responsavel2Telefone,
                updateData.responsavel2Parentesco,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Aluno não encontrado");

        return new Aluno(res.rows[0]);
    }

    async delete(id) {
        const res = await this.db.query(
            "DELETE FROM alunos WHERE id_alunos = $1",
            [id]
        );
        if (res.rowCount === 0) throw new Error("Aluno não encontrado");
    }
}
