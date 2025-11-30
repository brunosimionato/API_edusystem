import { Router } from 'express';

import { UsuarioService } from '../services/usuario.service.js';
import { DisciplinaService } from '../services/disciplina.service.js';
import { ProfessorRepository } from '../repositories/professor.repository.js'
import { ProfessorService } from '../services/professor.service.js';

import { createAuthMiddleware } from './auth.middleware.js';
import { NovoProfessor } from '../entities/professor.js';
import { NovoUsuario } from '../entities/usuario.js';

/**
 * Cria e retorna um router de professor
 */
export function createProfessorRouter(db, hashingService) {

    const usuarioService = new UsuarioService(db, hashingService);
    const disciplinaService = new DisciplinaService(db);
    const professorRepository = new ProfessorRepository(db);
    const professorService = new ProfessorService(
        db,
        usuarioService,
        disciplinaService,
        professorRepository
    );

    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    router.get('/', async (req, res) => {
        const professores = await professorService.list();
        res.json(professores);
    });


    // GET BY ID
    router.get('/:id', async (req, res) => {
        const professor = await professorService.getById(req.params.id);

        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }

        res.json(professor);
    });

    // CREATE
    router.post('/', async (req, res) => {

        if (!req.body.professor) {
            return res.status(400).json({ error: 'Dados do professor são obrigatórios' });
        }

        const professor = NovoProfessor.fromObj(req.body.professor);

        let usuario = null;
        if (req.body.usuario) {
            usuario = NovoUsuario.fromObj(req.body.usuario);
        }

        try {
            const professorCriado = await professorService.create(
                usuario,
                professor,
                req.body.professor.idDisciplinas ?? [],
                req.body.professor.turmas ?? []
            );

            res.status(201).json(professorCriado);

        } catch (error) {
            console.error("Erro ao criar professor:", error);
            res.status(400).json({ error: error.message });
        }
    });


    // UPDATE
    router.put('/:id', async (req, res) => {

        if (!req.body.professor) {
            return res.status(400).json({ error: 'Dados do professor são obrigatórios' });
        }

        const id = req.params.id;

        try {
            const professorAtualizado = await professorService.update(
                id,
                req.body.professor,
                req.body.professor.idDisciplinas ?? [],
                req.body.professor.turmas ?? [],
                req.body.usuario
            );

            res.json(professorAtualizado);

        } catch (error) {

            if (error.message === "Professor não encontrado") {
                return res.status(404).json({ error: error.message });
            }

            console.error("Erro no UPDATE:", error);
            res.status(400).json({ error: error.message });
        }
    });

    // DELETE
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
