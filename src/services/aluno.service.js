import { NovoAluno, Aluno } from '../entities/aluno.js';
import { NovoUsuario, Usuario } from '../entities/usuario.js';
import { UsuarioService } from './usuario.service.js';

export class AlunoService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     * @param {UsuarioService} usuarioService
     */
    constructor(db, usuarioService) {
        this.db = db;
        this.usuarioService = usuarioService;
    }

    /**
     * Cria um novo aluno (cria usuário e aluno)
     * @param {NovoAluno} novoAluno
     * @returns {Promise<Aluno>}
     */
    async create(novoAluno) {
        // Cria usuário
        const usuario = await this.usuarioService.create(
            novoAluno.usuario
        );

        // Cria aluno
        const res = await this.db.query(
            `INSERT INTO alunos (
                usuario_id, data_nascimento, responsavel_nome, nome_pai, nome_mae,
                profissao_pai, profissao_mae, alergias, telefone_pai, telefone_mae,
                email_pai, email_mae, idade, religiao
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14
            ) RETURNING *`,
            [
                usuario.id,
                novoAluno.data_nascimento,
                novoAluno.responsavel_nome,
                novoAluno.nome_pai,
                novoAluno.nome_mae,
                novoAluno.profissao_pai,
                novoAluno.profissao_mae,
                novoAluno.alergias,
                novoAluno.telefone_pai,
                novoAluno.telefone_mae,
                novoAluno.email_pai,
                novoAluno.email_mae,
                novoAluno.idade,
                novoAluno.religiao
            ]
        );

        return Aluno.fromRow(res.rows[0], usuario);
    }

    /**
     * Busca um aluno pelo ID
     * @param {number} id
     * @returns {Promise<Aluno|null>}
     */
    async getById(id) {
        const res = await this.db.query(
            `SELECT a.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM alunos a
             JOIN usuarios u ON a.usuario_id = u.id_usuarios
             WHERE a.id_alunos = $1`,
            [id]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return Aluno.fromRow(row, Usuario.fromRow(row));
    }

    /**
     * Busca um aluno pelo usuario_id
     * @param {number} usuarioId
     * @returns {Promise<Aluno|null>}
     */
    async getByUsuarioId(usuarioId) {
        const res = await this.db.query(
            `SELECT a.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM alunos a
             JOIN usuarios u ON a.usuario_id = u.id_usuarios
             WHERE a.usuario_id = $1`,
            [usuarioId]
        );
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return Aluno.fromRow(row, Usuario.fromRow(row));
    }

    /**
     * Lista todos os alunos
     * @returns {Promise<Aluno[]>}
     */
    async list() {
        const res = await this.db.query(
            `SELECT a.*, u.id_usuarios, u.nome, u.email, u.hash_senha, u.tipo_usuario
             FROM alunos a
             JOIN usuarios u ON a.usuario_id = u.id_usuarios`
        );
        return res.rows.map(row =>
            Aluno.fromRow(row, Usuario.fromRow(row))
        );
    }

    /**
     * Atualiza dados do aluno e do usuário
     * @param {number} id
     * @param {NovoAluno} novoAluno
     * @returns {Promise<Aluno>}
     */
    async update(id, novoAluno) {
        // Busca aluno para pegar usuario_id
        const res = await this.db.query(
            "SELECT usuario_id FROM alunos WHERE id_alunos = $1",
            [id]
        );
        if (res.rows.length === 0) throw new Error("Aluno não encontrado");
        const usuario_id = res.rows[0].usuario_id;

        // Atualiza usuário
        const updatedUsuario = await this.usuarioService.update(
            usuario_id,
            novoAluno.usuario
        );

        // Atualiza aluno
        const updateAlunoRes = await this.db.query(
            `UPDATE alunos SET
                data_nascimento = $1,
                responsavel_nome = $2,
                nome_pai = $3,
                nome_mae = $4,
                profissao_pai = $5,
                profissao_mae = $6,
                alergias = $7,
                telefone_pai = $8,
                telefone_mae = $9,
                email_pai = $10,
                email_mae = $11,
                idade = $12,
                religiao = $13
             WHERE id_alunos = $14
             RETURNING *`,
            [
                novoAluno.data_nascimento,
                novoAluno.responsavel_nome,
                novoAluno.nome_pai,
                novoAluno.nome_mae,
                novoAluno.profissao_pai,
                novoAluno.profissao_mae,
                novoAluno.alergias,
                novoAluno.telefone_pai,
                novoAluno.telefone_mae,
                novoAluno.email_pai,
                novoAluno.email_mae,
                novoAluno.idade,
                novoAluno.religiao,
                id
            ]
        );
        if (updateAlunoRes.rows.length === 0) throw new Error("Unreachable code");
        const row = updateAlunoRes.rows[0];

        return Aluno.fromRow(row, updatedUsuario);
    }

    /**
     * Deleta um aluno e seu usuário
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        // Busca aluno para pegar usuario_id
        const res = await this.db.query(
            "SELECT usuario_id FROM alunos WHERE id_alunos = $1",
            [id]
        );
        if (res.rows.length === 0) throw new Error("Aluno não encontrado");
        const usuario_id = res.rows[0].usuario_id;

        // Deleta aluno
        await this.db.query("DELETE FROM alunos WHERE id_alunos = $1", [id]);
        // Deleta usuário
        await this.db.query("DELETE FROM usuarios WHERE id_usuarios = $1", [usuario_id]);
    }
}
