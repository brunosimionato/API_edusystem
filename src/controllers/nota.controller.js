import { Router } from 'express';
import { NotaService } from '../services/nota.service.js';
import { createAuthMiddleware } from './auth.middleware.js';

export function createNotaRouter(db, hashingService) {
    const notaService = new NotaService(db);
    const router = Router();

    router.use(createAuthMiddleware(hashingService));

    // Rotas básicas CRUD
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

    // Médias trimestrais de um aluno
    router.get('/aluno/:idAluno/medias', async (req, res) => {
        try {
            const { idAluno } = req.params;
            const { anoLetivo } = req.query;

            if (!anoLetivo) {
                return res.status(400).json({ error: 'Ano letivo é obrigatório' });
            }

            const medias = await notaService.getMediasTrimestrais(idAluno, anoLetivo);
            res.json(medias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Situação final de um aluno (aprovado/reprovado)
    router.get('/aluno/:idAluno/situacao', async (req, res) => {
        try {
            const { idAluno } = req.params;
            const { anoLetivo } = req.query;

            if (!anoLetivo) {
                return res.status(400).json({ error: 'Ano letivo é obrigatório' });
            }

            const situacao = await notaService.getSituacaoFinal(idAluno, anoLetivo);
            res.json(situacao);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Notas por turma (para professores)
    router.get('/turma/:idTurma/notas', async (req, res) => {
        try {
            const { idTurma } = req.params;
            const { anoLetivo, trimestre } = req.query;

            if (!anoLetivo || !trimestre) {
                return res.status(400).json({
                    error: 'Ano letivo e trimestre são obrigatórios'
                });
            }

            const notas = await notaService.getNotasPorTurma(idTurma, anoLetivo, trimestre);
            res.json(notas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Boletim completo do aluno
    router.get('/aluno/:idAluno/boletim', async (req, res) => {
        try {
            const { idAluno } = req.params;
            const { anoLetivo } = req.query;

            if (!anoLetivo) {
                return res.status(400).json({ error: 'Ano letivo é obrigatório' });
            }

            const boletim = await notaService.getBoletimCompleto(idAluno, anoLetivo);
            res.json(boletim);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Estatísticas da turma
    router.get('/turma/:idTurma/estatisticas', async (req, res) => {
        try {
            const { idTurma } = req.params;
            const { anoLetivo, trimestre, idDisciplina } = req.query;

            if (!anoLetivo) {
                return res.status(400).json({ error: 'Ano letivo é obrigatório' });
            }

            const estatisticas = await notaService.getEstatisticasTurma(
                idTurma,
                anoLetivo,
                trimestre,
                idDisciplina
            );
            res.json(estatisticas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}