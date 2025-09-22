import { Router } from 'express';

import { AlunoRepository } from '../repositories/aluno.repository.js';
import { AlunoService } from '../services/aluno.service.js';
import { HashingService } from '../services/hashing.service.js';

import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de aluno, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createAlunoRouter(db, hashingService) {
    const alunoRepository = new AlunoRepository(db);
    const alunoService = new AlunoService(db, alunoRepository);
    const router = Router();

    router.use(createAuthMiddleware(hashingService))

    router.get('/', async (req, res) => {
        const alunos = await alunoService.list();
        res.json(alunos);
    });

    router.get('/:id', async (req, res) => {
        const aluno = await alunoService.getById(req.params.id);

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        res.json(aluno);
    });

    router.post('/', async (req, res) => {
        const novoAluno = req.body;
        console.log('Criando novo aluno:', novoAluno);

        try {
            const alunoCriado = await alunoService.create(novoAluno);
            res.status(201).json(alunoCriado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoAluno = req.body;

        try {
            const alunoAtualizado = await alunoService.update(id, novoAluno);

            res.json(alunoAtualizado);
        } catch (error) {
            if (error.message === "Aluno não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            await alunoService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Aluno não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}