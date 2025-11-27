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

function converterHistoricoBackendParaFront(historico) {
    const porAno = {};

    historico.forEach(h => {
        const ano = h.serieConcluida;

        if (!porAno[ano]) {
            porAno[ano] = {
                escolaAnterior: h.nomeEscola,
                serieAnterior: ano,
                anoConclusao: h.anoConclusao,
                notas: {
                    ensinoGlobalizado: "",
                    matematica: "",
                    portugues: "",
                    ciencias: "",
                    historia: "",
                    geografia: "",
                    ingles: "",
                    arte: "",
                    edFisica: "",
                }
            };
        }

        // Preencher nota na disciplina correta:
        porAno[ano].notas[mapearDisciplina(h.idDisciplina)] = h.nota;
    });

    // retorno como array ordenado por serie
    return Object.values(porAno).sort((a, b) =>
        a.serieAnterior.localeCompare(b.serieAnterior)
    );
}

function mapearDisciplina(id) {
    const map = {
        1: "matematica",
        2: "ensinoGlobalizado",
        3: "portugues",
        4: "ciencias",
        5: "historia",
        6: "geografia",
        7: "ingles",
        8: "arte",
        9: "edFisica"
    };

    return map[id];
}


export class AlunoService {
    constructor(db, alunoRepository, historicoEscolarRepository) {
        this.db = db;
        this.alunoRepository = alunoRepository;
        this.historicoEscolarRepository = historicoEscolarRepository; // agora existe
    }

    async list(filters = {}) {
        return await this.alunoRepository.list(filters);
    }

    async getById(id) {
        return await this.alunoRepository.getById(id);
    }

    async getByTurma(idTurma) {

        const alunos = await this.alunoRepository.getByTurma(idTurma);


        return alunos;
    }


    async create(novoAlunoPayload) {
        const client = await this.db.connect();

        const novoAluno = new NovoAluno(novoAlunoPayload);

        const { HistoricoEscolarService } = await import("./historico_escolar.service.js");
        const historicoEscolarService = new HistoricoEscolarService(client);

        try {
            await client.query("BEGIN");

            // Verificar CPF duplicado
            const cpfJaExiste = await this.alunoRepository.findByCPF(novoAluno.cpf, client);
            if (cpfJaExiste) {
                throw new Error("CPF já cadastrado");
            }

            // Criar aluno
            const alunoCriado = await this.alunoRepository.create(novoAluno, client);

            // Salvar matrícula
            await client.query(
                `INSERT INTO alunos_turmas (id_aluno, id_turma)
             VALUES ($1, $2)`,
                [alunoCriado.id, novoAluno.turma]
            );

            // Salvar histórico escolar (se houver)
            if (Array.isArray(novoAluno.historicoEscolar)) {
                for (const h of novoAluno.historicoEscolar) {

                    // 1º ao 5º ano → apenas ensino globalizado
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

                    // 6º ao 9º ano → todas as disciplinas (menos ensino globalizado)
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
            throw error;
        } finally {
            client.release();
        }
    }


    async update(id, updateData) {
        const client = await this.db.connect();

        const { HistoricoEscolarService } = await import("./historico_escolar.service.js");
        const historicoEscolarService = new HistoricoEscolarService(client);

        try {
            await client.query("BEGIN");



            // Atualiza dados básicos
            const alunoAtualizado = await this.alunoRepository.update(id, updateData);

            // Atualiza turma se enviada
            if (updateData.turma) {
                await client.query(
                    `UPDATE alunos_turmas
                 SET id_turma = $1, updated_at = NOW()
                 WHERE id_aluno = $2`,
                    [updateData.turma, id]
                );
            }

            // Atualizar histórico escolar
            if (
                updateData.historicoEscolar === null ||
                updateData.historicoEscolar === "null" ||
                (Array.isArray(updateData.historicoEscolar) && updateData.historicoEscolar.length === 0)
            ) {
                console.log("🗑️ [SERVICE] Apagando TODO histórico do aluno", id);

                await client.query(
                    "DELETE FROM historicos_escolares WHERE id_aluno = $1",
                    [id]
                );

            } else if (Array.isArray(updateData.historicoEscolar)) {

                // apagar o antigo
                await client.query(
                    "DELETE FROM historicos_escolares WHERE id_aluno = $1",
                    [id]
                );

                // recriar
                for (const ano of updateData.historicoEscolar) {
                    console.log("➕ Inserindo histórico:", ano);

                    await historicoEscolarService.create({
                        idAluno: id,
                        idDisciplina: ano.id_disciplina,
                        nomeEscola: ano.nome_escola,
                        serieConcluida: ano.serie_concluida,
                        anoConclusao: ano.ano_conclusao,
                        nota: ano.nota
                    });
                }
            }

            await client.query("COMMIT");

            console.log("🎉 UPDATE concluído com sucesso!");
            return alunoAtualizado;

        } catch (error) {
            await client.query("ROLLBACK");
            console.error("❌ [SERVICE] ERRO NO UPDATE:", error);
            throw error;
        } finally {
            client.release();
        }
    }


    // UPDATE
    async delete(id) {
        await this.alunoRepository.delete(id);
    }

    async getAlunoComHistorico(id) {
        console.log("📌 [SERVICE] Buscando aluno ID:", id);

        const aluno = await this.alunoRepository.getById(id);
        console.log("📚 [SERVICE] Dados do aluno:", aluno);

        if (!aluno) return null;

        const historico = await this.historicoEscolarRepository.getByAlunoId(id);
        console.log("📘 [SERVICE] Histórico escolar encontrado:", historico);

        return {
            ...aluno,
            historicoEscolar: historico
        };

    }

}
