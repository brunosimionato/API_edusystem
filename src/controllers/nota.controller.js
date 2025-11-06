// src/controllers/nota.controller.js - NOVO
import { Router } from 'express';
import { NotaService } from '../services/nota.service.js';
import { createAuthMiddleware } from './auth.middleware.js';

export function createNotaRouter(db, hashingService) {
    const notaService = new NotaService(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        try {
            const filters = req.query;
            const notas = await notaService.list(filters);
            res.json(notas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const nota = await notaService.getById(req.params.id);
            if (!nota) {
                return res.status(404).json({ error: 'Nota não encontrada' });
            }
            res.json(nota);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const novaNota = req.body;
            const notaCriada = await notaService.create(novaNota);
            res.status(201).json(notaCriada);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        try {
            const notaAtualizada = await notaService.update(req.params.id, req.body);
            res.json(notaAtualizada);
        } catch (error) {
            if (error.message === 'Nota não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            await notaService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error.message === 'Nota não encontrada') {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}