// src/controllers/aluno.controller.js
import express from 'express';
import { get_db } from '../db/index.js'; 
import { AlunoService } from '../services/aluno.service.js';
import { AlunoRepository } from '../repositories/aluno.repository.js';
import { createAuthMiddleware } from './auth.middleware.js';

export class AlunoController {
  constructor(db) { // ✅ Recebe db como parâmetro
    const alunoRepository = new AlunoRepository(db);
    this.alunoService = new AlunoService(db, alunoRepository);
  }

  async list(req, res) {
    try {
      const alunos = await this.alunoService.list();
      res.json(alunos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const aluno = await this.alunoService.getById(parseInt(id));
      
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      
      res.json(aluno);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const alunoData = req.body;
      
      if (alunoData.nascimento && typeof alunoData.nascimento === 'string') {
        alunoData.nascimento = new Date(alunoData.nascimento);
      }

      const novoAluno = await this.alunoService.create(alunoData);
      res.status(201).json(novoAluno);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const alunoAtualizado = await this.alunoService.update(parseInt(id), updateData);
      res.json(alunoAtualizado);
    } catch (error) {
      if (error.message === 'Aluno não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.alunoService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Aluno não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

// ✅ ADICIONE ESTA FUNÇÃO QUE ESTÁ FALTANDO
export function createAlunoRouter(db, hashingService) {
  const router = express.Router();
  const alunoController = new AlunoController(db);
  
  // Aplica autenticação em todas as rotas de alunos
  router.use(createAuthMiddleware(hashingService));
  
  router.get('/', (req, res) => alunoController.list(req, res));
  router.get('/:id', (req, res) => alunoController.getById(req, res));
  router.post('/', (req, res) => alunoController.create(req, res));
  router.put('/:id', (req, res) => alunoController.update(req, res));
  router.delete('/:id', (req, res) => alunoController.delete(req, res));
  
  return router;
}