import express from 'express';
import { ZodError } from "zod";
import { AlunoService } from '../services/aluno.service.js';
import { AlunoRepository } from '../repositories/aluno.repository.js';
import { createAuthMiddleware } from './auth.middleware.js';
import { HistoricoEscolarRepository } from "../repositories/historico_escolar.repository.js";

export class AlunoController {
  constructor(db) {
    const alunoRepository = new AlunoRepository(db);
    const historicoEscolarRepository = new HistoricoEscolarRepository(db);

    this.alunoService = new AlunoService(
      db,
      alunoRepository,
      historicoEscolarRepository
    );
  }

  async list(req, res) {
    try {
      const filters = req.query;
      const alunos = await this.alunoService.list(filters);
      res.json(alunos);

    } catch (error) {
      console.error('❌ Erro ao listar alunos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const aluno = await this.alunoService.getAlunoComHistorico(id);

      if (!aluno) {
        return res.status(404).json({ message: "Aluno não encontrado" });
      }

      return res.json(aluno);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar aluno" });
    }
  }

  async getByTurma(req, res) {
    try {
      const { idTurma } = req.params;
      const alunos = await this.alunoService.getByTurma(idTurma);
      res.json(alunos);
    } catch (error) {
      console.error("❌ Erro no getByTurma:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const alunoData = {
        nome: req.body.nome,
        cpf: req.body.cpf,
        cns: req.body.cns || null,
        nascimento: req.body.nascimento,
        genero: req.body.genero,
        religiao: req.body.religiao ?? null,
        telefone: req.body.telefone,

        logradouro: req.body.logradouro,
        numero: req.body.numero,
        bairro: req.body.bairro,
        cep: req.body.cep,
        cidade: req.body.cidade,
        estado: req.body.estado,

        responsavel1Nome: req.body.responsavel1Nome,
        responsavel1Cpf: req.body.responsavel1Cpf,
        responsavel1Telefone: req.body.responsavel1Telefone,
        responsavel1Parentesco: req.body.responsavel1Parentesco,

        responsavel2Nome: req.body.responsavel2Nome || null,
        responsavel2Cpf: req.body.responsavel2Cpf || null,
        responsavel2Telefone: req.body.responsavel2Telefone || null,
        responsavel2Parentesco: req.body.responsavel2Parentesco || null,

        turma: req.body.turma ? Number(req.body.turma) : null,
        anoLetivo: req.body.anoLetivo ? Number(req.body.anoLetivo) : new Date().getFullYear(),

        historicoEscolar: req.body.historicoEscolar ?? null
      };

      const novoAluno = await this.alunoService.create(alunoData);
      res.status(201).json(novoAluno);

    } catch (error) {
      if (error instanceof ZodError) {
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

      let data = { ...req.body };

      data.responsavel1Nome = data.responsavel1Nome ?? "";
      data.responsavel1Cpf = data.responsavel1Cpf ?? "";
      data.responsavel1Telefone = data.responsavel1Telefone ?? "";
      data.responsavel1Parentesco = data.responsavel1Parentesco ?? "";

      data.responsavel2Nome = data.responsavel2Nome ?? null;
      data.responsavel2Cpf = data.responsavel2Cpf ?? null;
      data.responsavel2Telefone = data.responsavel2Telefone ?? null;
      data.responsavel2Parentesco = data.responsavel2Parentesco ?? null;

      const alunoAtualizado = await this.alunoService.update(parseInt(id), data);
      return res.json(alunoAtualizado);

    } catch (error) {
      console.error("❌ Erro no UPDATE:", error);

      if (error.message === "Aluno não encontrado") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("CPF")) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro ao atualizar aluno" });
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

  router.get('/turma/:idTurma', (req, res) => alunoController.getByTurma(req, res));
  router.get('/', (req, res) => alunoController.list(req, res));
  router.post('/', (req, res) => alunoController.create(req, res));
  router.put('/:id', (req, res) => alunoController.update(req, res));
  router.get('/:id', (req, res) => alunoController.getById(req, res));
  router.delete('/:id', (req, res) => alunoController.delete(req, res));

  return router;
}