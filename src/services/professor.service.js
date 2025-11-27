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

        console.log("CREATE Professor - Dados recebidos:");
        console.log("Usuário:", novoUsuario);
        console.log("Professor:", professorPayload);
        console.log("Disciplinas:", disciplinas);
        console.log("Turmas:", turmas);

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

            try {
                await this.usuarioService.update(atual.idUsuario, {
                    nome: usuarioPayload.nome,
                    email: usuarioPayload.email,
                    tipo_usuario: "professor"
                });
                console.log("✅ Usuário atualizado com sucesso");
            } catch (error) {
                console.error("❌ Erro ao atualizar usuário:", error);
                throw new Error("Falha ao atualizar dados do usuário: " + error.message);
            }
        } else {
            console.log("⚠️  Dados de usuário não fornecidos ou ID usuário não encontrado");
        }

        // 3. Preparar dados do professor com relacionamentos
        const professorCompleto = {
            ...professorPayload,
            idDisciplinaEspecialidade: professorPayload.idDisciplinaEspecialidade,
            idDisciplinas: disciplinas,
            turmas: turmas
        };

        console.log("🎯 Dados completos do professor:", professorCompleto);

        // 4. Converter e validar dados do professor
        const parsedProfessor = NovoProfessor.fromObj(professorCompleto);

        // 5. Atualizar professor
        try {
            await this.professorRepository.update(id, parsedProfessor);
        } catch (error) {
            console.error("❌ Erro ao atualizar professor:", error);
            throw new Error("Falha ao atualizar dados do professor: " + error.message);
        }

        // 6. Atualizar relacionamentos
        try {
            await this.professorRepository.saveProfessorDisciplinas(id, disciplinas);
            console.log("✅ Disciplinas atualizadas:", disciplinas);

            await this.professorRepository.saveProfessorTurmas(id, turmas);
            console.log("✅ Turmas atualizadas:", turmas);
        } catch (error) {
            console.error("❌ Erro ao atualizar relacionamentos:", error);
            throw new Error("Falha ao atualizar disciplinas/turmas: " + error.message);
        }

        // 7. Retornar professor atualizado
        const professorAtualizado = await this.getById(id);
        console.log("🎉 Professor completamente atualizado:", professorAtualizado);

        return professorAtualizado;
    }

    //DELETE
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