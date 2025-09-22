import { Router } from 'express';

import { HistoricoEscolarRepository } from '../repositories/historico_escolar.repository.js';
import { HistoricoEscolarService } from '../services/historico_escolar.service.js';
import { HashingService } from '../services/hashing.service.js';

import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de histórico escolar, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createHistoricoEscolarRouter(db, hashingService) {
    const historicoEscolarRepository = new HistoricoEscolarRepository(db);
    const historicoEscolarService = new HistoricoEscolarService(db, historicoEscolarRepository);
    const router = Router();

    router.use(createAuthMiddleware(hashingService))

    router.get('/', async (req, res) => {
        const historicos = await historicoEscolarService.list();
        res.json(historicos);
    });

    router.get('/:id', async (req, res) => {
        const historico = await historicoEscolarService.getById(req.params.id);

        if (!historico) {
            return res.status(404).json({ error: 'Histórico escolar não encontrado' });
        }

        res.json(historico);
    });

    router.get('/aluno/:alunoId', async (req, res) => {
        const historicos = await historicoEscolarService.getByAlunoId(req.params.alunoId);
        res.json(historicos);
    });

    router.get('/disciplina/:disciplinaId', async (req, res) => {
        const historicos = await historicoEscolarService.getByDisciplinaId(req.params.disciplinaId);
        res.json(historicos);
    });

    router.post('/', async (req, res) => {
        const novoHistorico = req.body;
        console.log('Criando novo histórico escolar:', novoHistorico);

        try {
            const historicoCriado = await historicoEscolarService.create(novoHistorico);
            res.status(201).json(historicoCriado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoHistorico = req.body;

        try {
            const historicoAtualizado = await historicoEscolarService.update(id, novoHistorico);

            res.json(historicoAtualizado);
        } catch (error) {
            if (error.message === "Histórico escolar não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            await historicoEscolarService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Histórico escolar não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}