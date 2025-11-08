import express from 'express';
import { ZodError } from "zod";
import { get_db } from '../db/index.js'; 
import { AlunoService } from '../services/aluno.service.js';
import { AlunoRepository } from '../repositories/aluno.repository.js';
import { createAuthMiddleware } from './auth.middleware.js';

export class AlunoController {
  constructor(db) {
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
  console.log("📥 RECEBIDO DO FRONT:", JSON.stringify(req.body, null, 2));
  console.log("🟣 DUMP do historicoEscolar recebido:", req.body.historicoEscolar);
  

  try {
    const alunoData = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      cns: req.body.cns,
      nascimento: req.body.dataNascimento,  
      genero: req.body.genero,
      religiao: req.body.religiao ?? null,
      telefone: req.body.telefone,
      logradouro: req.body.rua,             
      numero: req.body.numero,
      bairro: req.body.bairro,
      cep: req.body.cep,
      cidade: req.body.cidade,
      estado: req.body.estado,

      responsavel1Nome: req.body.nomeR1,
      responsavel1Cpf: req.body.cpfR1,
      responsavel1Telefone: req.body.telefoneR1,
      responsavel1Parentesco: req.body.parentescoR1,

      responsavel2Nome: req.body.nomeR2 ?? null,
      responsavel2Cpf: req.body.cpfR2 ?? null,
      responsavel2Telefone: req.body.telefoneR2 ?? null,
      responsavel2Parentesco: req.body.parentescoR2 ?? null,

      turma: req.body.turma ? Number(req.body.turma) : null,
      historicoEscolar: req.body.historicoEscolar ?? null
    };

    const novoAluno = await this.alunoService.create(alunoData);
    res.status(201).json(novoAluno);

} catch (error) {
  if (error instanceof ZodError) {
    console.error("❌ Erro de validação ZOD:", error.issues);
    return res.status(400).json({
      error: "Dados inválidos",
      detalhes: error.issues,
    });
  }
  console.error("❌ Erro inesperado no CREATE:", error);
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

export function createAlunoRouter(db, hashingService) {
  const router = express.Router();
  const alunoController = new AlunoController(db);
  
  router.use(createAuthMiddleware(hashingService));
  
  router.get('/', (req, res) => alunoController.list(req, res));
  router.get('/:id', (req, res) => alunoController.getById(req, res));
  router.post('/', (req, res) => alunoController.create(req, res));
  router.put('/:id', (req, res) => alunoController.update(req, res));
  router.delete('/:id', (req, res) => alunoController.delete(req, res));
  
  return router;
}