import { Router } from 'express';

import { UsuarioService } from '../services/usuario.service.js';

import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de usuário, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createUsuarioRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        const usuarios = await usuarioService.list();

        res.json(usuarios);
    });

    router.get('/:id', async (req, res) => {
        const usuario = await usuarioService.getById(req.params.id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(usuario);
    });

    router.post('/', async (req, res) => {
        const novoUsuario = req.body;

        try {
            const usuarioCriado = await usuarioService.create(novoUsuario);
            res.status(201).json(usuarioCriado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoUsuario = req.body;

        try {
            const usuarioAtualizado = await usuarioService.update(id, novoUsuario);

            res.json(usuarioAtualizado);
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            await usuarioService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    });

    return router;
}