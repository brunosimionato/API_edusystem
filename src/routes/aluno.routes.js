// src/routes/aluno.routes.js
import express from 'express';
import { AlunoController } from '../controllers/aluno.controller.js';

const router = express.Router();
const alunoController = new AlunoController();

router.get('/', (req, res) => alunoController.list(req, res));
router.get('/:id', (req, res) => alunoController.getById(req, res));
router.post('/', (req, res) => alunoController.create(req, res));
router.put('/:id', (req, res) => alunoController.update(req, res));
router.delete('/:id', (req, res) => alunoController.delete(req, res));

export default router;