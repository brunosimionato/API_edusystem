import { Router } from 'express';

import { SecretariaService } from '../services/secretaria.service.js';
import { UsuarioService } from '../services/usuario.service.js';

import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de secretaria, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createSecretariaRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const secretariaService = new SecretariaService(db, usuarioService);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        const secretarias = await secretariaService.list();
        res.json(secretarias);
    });

    router.get('/:id', async (req, res) => {
        const secretaria = await secretariaService.getById(req.params.id);

        if (!secretaria) {
            return res.status(404).json({ error: 'Secretaria não encontrada' });
        }

        res.json(secretaria);
    });

    router.post('/', async (req, res) => {
        const novoSecretaria = req.body;

        try {
            const secretariaCriada = await secretariaService.create(novoSecretaria);
            res.status(201).json(secretariaCriada);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoSecretaria = req.body;

        try {
            const secretariaAtualizada = await secretariaService.update(id, novoSecretaria);

            res.json(secretariaAtualizada);
        } catch (error) {
            if (error.message === "Secretaria não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            await secretariaService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Secretaria não encontrada") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}
