import { Router } from 'express';

import { DisciplinaService } from '../services/disciplina.service.js';

import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de matéria, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createDisciplinaRouter(db, hashingService) {
    const disciplinaService = new DisciplinaService(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        const disciplinas = await disciplinaService.list();
        res.json(disciplinas);
    });

    router.get('/:id', async (req, res) => {
        const disciplina = await disciplinaService.getById(req.params.id);
        if (!disciplina) {
            return res.status(404).json({ error: 'Disciplina não encontrada' });
        }
        res.json(disciplina);
    });

    router.post('/', async (req, res) => {
        const novaDisciplina = req.body;
        try {
            const disciplinaCriada = await disciplinaService.create(novaDisciplina);
            res.status(201).json(disciplinaCriada);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoMateria = req.body;
        try {
            const disciplinaAtualizada = await disciplinaService.update(id, novoMateria);
            res.json(disciplinaAtualizada);
        } catch (error) {
            if (error.message === "Disciplina não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            await disciplinaService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Disciplina não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}
