import { Router } from 'express';
import { z } from 'zod/v4'

import { TurmaService } from '../services/turma.service.js';
import { createAuthMiddleware } from './auth.middleware.js';

const turmaParamsSchema = z.object({
    with: z.enum(['alunos']).optional()
});

/**
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * @returns {Router}
 */
export function createTurmaRouter(db, hashingService) {
    const turmaService = new TurmaService(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        const { success, data } = turmaParamsSchema.safeParse(req.query);

        const params = success ? data : {};

        const turmas = await turmaService.list(params);
        res.json(turmas);
    });

    router.get('/:id', async (req, res) => {
        const { success, data } = turmaParamsSchema.safeParse(req.query);

        const params = success ? data : {};

        const turma = await turmaService.getById(req.params.id, params);
        if (!turma) return res.status(404).json({ error: 'Turma não encontrada' });
        res.json(turma);
    });

    router.post('/', async (req, res) => {
        try {
            const turma = await turmaService.create(req.body);
            res.status(201).json(turma);
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const turma = await turmaService.update(req.params.id, req.body);
            res.json(turma);
        } catch (e) {
            if (e.message === 'Turma não encontrada') return res.status(404).json({ error: e.message });
            res.status(400).json({ error: e.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            await turmaService.delete(req.params.id);
            res.status(204).send();
        } catch (e) {
            if (e.message === 'Turma não encontrada') return res.status(404).json({ error: e.message });
            res.status(400).json({ error: e.message });
        }
    });

    return router;
}