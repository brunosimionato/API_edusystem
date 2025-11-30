import { NovoProfessor } from "../entities/professor.js";

export class ProfessorService {

    constructor(db, usuarioService, disciplinaService, professorRepository) {
        this.db = db;
        this.usuarioService = usuarioService;
        this.disciplinaService = disciplinaService;
        this.professorRepository = professorRepository;
    }

    /* ============================================================
       LISTAR
    ============================================================ */
    async list() {
        const professores = await this.professorRepository.list();

        return Promise.all(
            professores.map(async (prof) => ({
                ...prof,
                usuario: await this.usuarioService.getById(prof.idUsuario),
                disciplinaEspecialidade:
                    await this.disciplinaService.getById(prof.idDisciplinaEspecialidade),
                disciplinas:
                    await this.professorRepository.getProfessorDisciplinas(prof.id),
                turmas:
                    await this.professorRepository.getProfessorTurmas(prof.id)
            }))
        );
    }

    // GET BY ID
    async getById(id) {
        const professor = await this.professorRepository.getById(id);
        if (!professor) return null;

        return {
            ...professor,
            usuario: await this.usuarioService.getById(professor.idUsuario),
            disciplinaEspecialidade:
                await this.disciplinaService.getById(professor.idDisciplinaEspecialidade),
            disciplinas:
                await this.professorRepository.getProfessorDisciplinas(professor.id),
            turmas:
                await this.professorRepository.getProfessorTurmas(professor.id)
        };
    }

    // CREATE
    async create(novoUsuario, professorPayload, disciplinas = [], turmas = []) {
        const novoProfessor = NovoProfessor.fromObj({
            ...professorPayload,
            idDisciplinas: disciplinas,
            turmas: turmas
        });

        // Criar usuário
        if (!novoProfessor.idUsuario) {
            const createdUser = await this.usuarioService.create({
                ...novoUsuario,
                tipo_usuario: "professor"
            });

            novoProfessor.idUsuario = createdUser.id;
        }

        // Criar professor
        const professor = await this.professorRepository.create(novoProfessor);

        // Relacionamentos
        await this.professorRepository.saveProfessorDisciplinas(
            professor.id,
            novoProfessor.idDisciplinas ?? []
        );

        await this.professorRepository.saveProfessorTurmas(
            professor.id,
            novoProfessor.turmas ?? []
        );

        return this.getById(professor.id);
    }

    // UPDATE
    async update(id, professorPayload, disciplinas, turmas, usuarioPayload) {
        // 1. Buscar professor existente
        const atual = await this.professorRepository.getById(id);
        if (!atual) {
            throw new Error("Professor não encontrado");
        }

        // 2. ATUALIZAR USUÁRIO (ONDE ESTÁ O NOME)
        if (usuarioPayload && atual.idUsuario) {
            await this.usuarioService.update(atual.idUsuario, {
                nome: usuarioPayload.nome,
                email: usuarioPayload.email,
                tipo_usuario: "professor"
            });
        }

        // 3. Preparar dados do professor com relacionamentos
        const professorCompleto = {
            ...professorPayload,
            idDisciplinaEspecialidade: professorPayload.idDisciplinaEspecialidade,
            idDisciplinas: disciplinas,
            turmas: turmas
        };

        // 4. Converter e validar dados do professor
        const parsedProfessor = NovoProfessor.fromObj(professorCompleto);

        // 5. Atualizar professor
        await this.professorRepository.update(id, parsedProfessor);

        // 6. Atualizar relacionamentos
        await this.professorRepository.saveProfessorDisciplinas(id, disciplinas);
        await this.professorRepository.saveProfessorTurmas(id, turmas);

        // 7. Retornar professor atualizado
        return await this.getById(id);
    }

    // DELETE
    async delete(id) {
        const professor = await this.professorRepository.getById(id);
        if (!professor)
            throw new Error("Professor não encontrado");

        await this.professorRepository.saveProfessorDisciplinas(id, []);
        await this.professorRepository.saveProfessorTurmas(id, []);

        await this.professorRepository.delete(id);
        await this.usuarioService.delete(professor.idUsuario);
    }

    // GET BY USUARIO ID
    async getByUsuarioId(usuarioId) {
        const professor = await this.professorRepository.getByUsuarioId(usuarioId);

        if (!professor) {
            return null;
        }

        // Carregar dados completos
        const professorCompleto = {
            ...professor,
            usuario: await this.usuarioService.getById(professor.idUsuario),
            disciplinaEspecialidade: await this.disciplinaService.getById(professor.idDisciplinaEspecialidade),
            disciplinas: await this.professorRepository.getProfessorDisciplinas(professor.id),
            turmas: await this.professorRepository.getProfessorTurmas(professor.id)
        };

        return professorCompleto;
    }
}