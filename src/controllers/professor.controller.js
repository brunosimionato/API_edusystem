import { Router } from 'express';

import { UsuarioService } from '../services/usuario.service.js';
import { DisciplinaService } from '../services/disciplina.service.js';
import { ProfessorRepository } from '../repositories/professor.repository.js'
import { ProfessorService } from '../services/professor.service.js';

import { createAuthMiddleware } from './auth.middleware.js';
import { NovoProfessor } from '../entities/professor.js';
import { NovoUsuario } from '../entities/usuario.js';

/**
 * Cria e retorna um router de professor, recebendo a conexão db
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createProfessorRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const disciplinaService = new DisciplinaService(db);
    const professorRepository = new ProfessorRepository(db);
    const professorService = new ProfessorService(db, usuarioService, disciplinaService, professorRepository);
    const router = Router();

    router.use(createAuthMiddleware(hashingService))

    router.get('/', async (req, res) => {
        const professores = await professorService.list();
        res.json(professores);
    });

    router.get('/:id', async (req, res) => {
        const professor = await professorService.getById(req.params.id);

        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }

        res.json(professor);
    });

    router.post('/', async (req, res) => {
        if (!req.body.professor) {
            return res.status(400).json({ error: 'Dados do professor são obrigatórios' });
        }

        const professor = NovoProfessor.fromObj(req.body.professor)

        let usuario = null;
        if (req.body.usuario) {
            usuario = NovoUsuario.fromObj(req.body.usuario)
        }

        try {
            const professorCriado = await professorService.create(usuario, professor);
            res.status(201).json(professorCriado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const novoProfessor = req.body;

        try {
            const professorAtualizado = await professorService.update(id, novoProfessor);

            res.json(professorAtualizado);
        } catch (error) {
            if (error.message === "Professor não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            await professorService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Professor não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}
