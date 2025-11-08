import { Router } from "express";
import { HistoricoEscolarRepository } from "../repositories/historico_escolar.repository.js";
import { HistoricoEscolarService } from "../services/historico_escolar.service.js";
import { NovoHistoricoEscolar } from "../entities/historico_escolar.js";
import { createAuthMiddleware } from "./auth.middleware.js";

export function createHistoricoEscolarRouter(db, hashingService) {
    const historicoEscolarRepository = new HistoricoEscolarRepository(db);
    const historicoEscolarService = new HistoricoEscolarService(db, historicoEscolarRepository);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    // ✅ ROTAS ESPECÍFICAS primeiro para evitar conflito
    router.get("/aluno/:alunoId", async (req, res) => {
        const historicos = await historicoEscolarService.getByAlunoId(req.params.alunoId);
        res.json(historicos);
    });

    router.get("/disciplina/:disciplinaId", async (req, res) => {
        const historicos = await historicoEscolarService.getByDisciplinaId(req.params.disciplinaId);
        res.json(historicos);
    });

    // ✅ LISTAR TODOS
    router.get("/", async (req, res) => {
        const historicos = await historicoEscolarService.list();
        res.json(historicos);
    });

    // ✅ BUSCAR POR ID (colocar por último!)
    router.get("/:id", async (req, res) => {
        const historico = await historicoEscolarService.getById(req.params.id);
        if (!historico) {
            return res.status(404).json({ error: "Histórico escolar não encontrado" });
        }
        res.json(historico);
    });

    // ✅ CRIAR (apenas se usar para edição posterior)
    router.post("/", async (req, res) => {
        try {
            const novoHistorico = NovoHistoricoEscolar.fromObj(req.body);
            const historicoCriado = await historicoEscolarService.create(novoHistorico);
            res.status(201).json(historicoCriado);
        } catch (error) {
            if (error.name === "ZodError") {
                return res.status(400).json({
                    error: "Dados inválidos",
                    detalhes: error.errors,
                });
            }
            res.status(500).json({ error: error.message });
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const historicoAtualizado = await historicoEscolarService.update(req.params.id, req.body);
            res.json(historicoAtualizado);
        } catch (error) {
            if (error.message === "Histórico escolar não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            await historicoEscolarService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Histórico escolar não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
