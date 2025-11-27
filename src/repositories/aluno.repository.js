import { NovoAluno, Aluno } from "../entities/aluno.js";

export class AlunoRepository {
    constructor(db) {
        this.db = db;
    }

    async findByCPF(cpf, client = this.db) {
        const res = await client.query(`SELECT * FROM alunos WHERE cpf = $1`, [
            cpf,
        ]);

        // retorna linha ou null
        return res.rows[0] || null;
    }

    async list(filters = {}) {
        let query = `
            SELECT a.*, at.id_turma 
            FROM alunos a 
            LEFT JOIN alunos_turmas at ON a.id_alunos = at.id_aluno 
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 0;

        if (filters.turmaId) {
            paramCount++;
            query += ` AND at.id_turma = $${paramCount}`;
            params.push(filters.turmaId);
        }

        query += " ORDER BY a.nome";

        const res = await this.db.query(query, params);
        return res.rows.map((row) => this.mapRowToAluno(row));
    }

    mapRowToAluno(row) {
        return {
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
            turmaId: row.id_turma,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getById(id) {
        console.log(`[REPOSITORY] Buscando aluno ID: ${id}`);

        const alunoRes = await this.db.query(
            `SELECT * FROM alunos WHERE id_alunos = $1`,
            [id]
        );

        if (alunoRes.rows.length === 0) {
            console.warn("Aluno não encontrado.");
            return null;
        }

        const aluno = alunoRes.rows[0];

        const turmaRes = await this.db.query(
            `SELECT id_turma
            FROM alunos_turmas
            WHERE id_aluno = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [id]
        );

        const turmaInfo = turmaRes.rows[0] || null;

        const historicoRes = await this.db.query(
            `SELECT
                h.id_historicos_escolares AS id_historico,
                h.id_disciplina,
                d.nome AS disciplina,
                h.nome_escola,
                h.serie_concluida,
                h.ano_conclusao,
                h.nota,
                h.created_at,
                h.updated_at
            FROM historicos_escolares h
            LEFT JOIN disciplinas d ON d.id_disciplinas = h.id_disciplina
            WHERE h.id_aluno = $1
            ORDER BY h.ano_conclusao DESC`,
            [id]
        );

        console.log(
            "[REPOSITORY] Histórico escolar encontrado:",
            historicoRes.rows
        );

        return {
            id: aluno.id_alunos,
            nome: aluno.nome,
            cpf: aluno.cpf,
            cns: aluno.cns,
            nascimento: aluno.nascimento,
            genero: aluno.genero,
            religiao: aluno.religiao,
            telefone: aluno.telefone,
            logradouro: aluno.logradouro,
            numero: aluno.numero,
            bairro: aluno.bairro,
            cep: aluno.cep,
            cidade: aluno.cidade,
            estado: aluno.estado,

            responsavel1Nome: aluno.responsavel1_nome,
            responsavel1Cpf: aluno.responsavel1_cpf,
            responsavel1Telefone: aluno.responsavel1_telefone,
            responsavel1Parentesco: aluno.responsavel1_parentesco,

            responsavel2Nome: aluno.responsavel2_nome,
            responsavel2Cpf: aluno.responsavel2_cpf,
            responsavel2Telefone: aluno.responsavel2_telefone,
            responsavel2Parentesco: aluno.responsavel2_parentesco,

            createdAt: aluno.created_at,
            updatedAt: aluno.updated_at,

            turma: turmaInfo?.id_turma ?? null,
            anoLetivo: null,

            historicoEscolar: historicoRes.rows,
        };
    }

    async getByTurma(idTurma) {
        const res = await this.db.query(
            `
            SELECT a.*
            FROM alunos a
            INNER JOIN alunos_turmas at ON at.id_aluno = a.id_alunos
            WHERE at.id_turma = $1
            ORDER BY a.nome ASC
            `,
            [idTurma]
        );

        return res.rows.map((row) => this.mapRowToAluno(row));
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
        responsavel2_parentesco,
        created_at,
        updated_at
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21,
        NOW(), NOW()
    )
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
                    novoAluno.responsavel2Nome || null,
                    novoAluno.responsavel2Cpf || null,
                    novoAluno.responsavel2Telefone || null,
                    novoAluno.responsavel2Parentesco || null,
                ]
            );

            return new Aluno(this.mapRowToAluno(res.rows[0]));
        } catch (error) {
            throw error;
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

                id,
            ]
        );

        if (res.rows.length === 0) throw new Error("Aluno não encontrado");

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
            updatedAt: row.updated_at,
        });
    }

    async delete(id) {
        console.log("🗑️ [REPOSITORY] Deletando aluno ID:", id);

        await this.db.query("BEGIN");

        await this.db.query(
            `DELETE FROM historicos_escolares 
         WHERE id_aluno = $1`,
            [id]
        );

        await this.db.query(
            `DELETE FROM alunos_turmas 
         WHERE id_aluno = $1`,
            [id]
        );

        const res = await this.db.query(
            `DELETE FROM alunos 
         WHERE id_alunos = $1`,
            [id]
        );

        await this.db.query("COMMIT");

        if (res.rowCount === 0) throw new Error("Aluno não encontrado!");
    }
}
