import { NovoAluno } from "../entities/aluno.js";

const disciplinaMap = {
    matematica: 1,
    ensinoGlobalizado: 2,
    portugues: 3,
    ciencias: 4,
    historia: 5,
    geografia: 6,
    ingles: 7,
    arte: 8,
    edFisica: 9,
};

export class AlunoService {
    constructor(db, alunoRepository) {
        this.db = db;
        this.alunoRepository = alunoRepository;
    }

    async list() {
        return await this.alunoRepository.list();
    }

    async getById(id) {
        return await this.alunoRepository.getById(id);
    }

    async create(novoAlunoPayload) {
        const client = await this.db.connect();

        const novoAluno = new NovoAluno(novoAlunoPayload);
        console.log("✅ NovoAluno validado:", novoAluno);
        console.log("📌 Histórico recebido do front:", novoAluno.historicoEscolar);

        const { HistoricoEscolarService } = await import("./historico_escolar.service.js");
        const historicoEscolarService = new HistoricoEscolarService(client);

        try {
            await client.query("BEGIN");

            const alunoCriado = await this.alunoRepository.create(novoAluno, client);

            // Salva matrícula
            if (novoAluno.turma) {
                await client.query(
                    `INSERT INTO alunos_turmas (id_aluno, id_turma) VALUES ($1, $2)`,
                    [alunoCriado.id, novoAluno.turma]
                );
            }

            // Salva histórico escolar
            if (Array.isArray(novoAluno.historicoEscolar)) {

                for (const h of novoAluno.historicoEscolar) {

                    // ✅ 1º ao 5º ano → Apenas ensino globalizado
                    if (["1ano", "2ano", "3ano", "4ano", "5ano"].includes(h.serieAnterior)) {

                        await historicoEscolarService.create({
                            idAluno: alunoCriado.id,
                            idDisciplina: disciplinaMap["ensinoGlobalizado"],
                            nomeEscola: h.escolaAnterior,
                            serieConcluida: h.serieAnterior,
                            nota: Number(h.notas?.ensinoGlobalizado || 0),
                            anoConclusao: h.anoConclusao
                        });

                        continue;
                    }

                    // ✅ 6º ao 9º ano → todas as disciplinas (exceto ensino globalizado)
                    if (["6ano", "7ano", "8ano", "9ano"].includes(h.serieAnterior)) {
                        for (const materia in h.notas) {

                            if (materia === "ensinoGlobalizado") continue;

                            const nota = h.notas[materia];
                            if (nota == null || nota === "") continue;

                            await historicoEscolarService.create({
                                idAluno: alunoCriado.id,
                                idDisciplina: disciplinaMap[materia],
                                nomeEscola: h.escolaAnterior,
                                serieConcluida: h.serieAnterior,
                                nota: Number(nota),
                                anoConclusao: h.anoConclusao
                            });
                        }
                    }
                }
            }

            await client.query("COMMIT");
            return alunoCriado;

        } catch (error) {
            await client.query("ROLLBACK");
            console.error("❌ Erro ao criar aluno + histórico:", error);
            throw error;

        } finally {
            client.release();
        }
    }

    async update(id, updateData) {
        return await this.alunoRepository.update(id, updateData);
    }

    async delete(id) {
        await this.alunoRepository.delete(id);
    }
}
