import { NovoProfessor, Professor } from '../entities/professor.js';
import { NovoUsuario } from '../entities/usuario.js';

export class ProfessorService {
    /**
     * @param {import('../db/index.js').PoolClient} db
     * @param {import('./usuario.service.js').UsuarioService} usuarioService
     * @param {import('./disciplina.service.js').DisciplinaService} disciplinaService
     * @param {import('../repositories/professor.repository.js').ProfessorRepository} professorRepository
     */
    constructor(db, usuarioService, disciplinaService, professorRepository) {
        this.db = db;
        this.usuarioService = usuarioService;
        this.disciplinaService = disciplinaService;
        this.professorRepository = professorRepository;
    }

    /**
     * Lista todos os professores
     * @returns {Promise<Professor[]>}
     */
async list() {
    const professores = await this.professorRepository.list();

    const listaCompletada = await Promise.all(
        professores.map(async (professor) => {
            const usuario = await this.usuarioService.getById(professor.idUsuario);

            // ⛔ Se o usuário estiver inativo, ignora o professor
            if (!usuario || usuario.ativo === false) {
                return null;
            }

            const disciplinaEspecialidade = await this.disciplinaService.getById(professor.idDisciplinaEspecialidade);

            return {
                ...professor,
                usuario,
                disciplinaEspecialidade,
                disciplinas: []
            };
        })
    );

    // ✅ Remove os "null" (professores cujo usuário está inativo)
    return listaCompletada.filter(p => p !== null);
}

    /**
     * Busca um professor pelo ID
     * @param {number} id
     * @returns {Promise<Professor|null>}
     */
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

    /**
     * Busca um professor pelo usuario_id
     * @param {number} usuarioId
     * @returns {Promise<Professor|null>}
     */
    async getByUsuarioId(usuarioId) {
        const res = await this.db.query(
            `SELECT * FROM professores WHERE id_usuario = $1`,
            [usuarioId]
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

    /**
     * Cria um novo professor (usando IDs de usuario e disciplina existentes)
     * @param {NovoUsuario|null} novoUsuario
     * @param {NovoProfessor} novoProfessor
     * @returns {Promise<Professor>}
     */
    async create(novoUsuario, novoProfessor) {
        if (!novoProfessor.idUsuario) {
            const createdUser = await this.usuarioService.create({
                ...novoUsuario,
                tipo_usuario: 'professor'
            });
            novoProfessor.idUsuario = createdUser.id;
        }

        const professor = await this.professorRepository.create(novoProfessor)

        return professor;
    }

    /**
     * Atualiza dados do professor
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Professor>}
     */
    async update(id, updateData) {
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
                updateData.idDisciplinaEspecialidade,
                updateData.telefone,
                updateData.genero,
                updateData.cpf,
                updateData.nascimento,
                updateData.logradouro,
                updateData.numero,
                updateData.bairro,
                updateData.cep,
                updateData.cidade,
                updateData.estado,
                updateData.formacaoAcademica,
                id
            ]
        );

        if (res.rows.length === 0) throw new Error("Professor não encontrado");

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

    /**
     * Deleta um professor
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        // Busca professor para pegar id_usuario
        const profRes = await this.db.query(
            "SELECT id_usuario FROM professores WHERE id_professores = $1",
            [id]
        );
        if (profRes.rows.length === 0) throw new Error("Professor não encontrado");
        const usuario_id = profRes.rows[0].id_usuario;

        // Deleta professor
        await this.db.query("DELETE FROM professores WHERE id_professores = $1", [id]);
        // Deleta usuário
        await this.db.query("DELETE FROM usuarios WHERE id_usuarios = $1", [usuario_id]);
    }
}
