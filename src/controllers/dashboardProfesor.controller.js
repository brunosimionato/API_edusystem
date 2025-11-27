import express from 'express';
import { createAuthMiddleware } from './auth.middleware.js';

export class DashboardProfessorController {
  constructor(db) {
    this.db = db;
  }

  async getDashboardData(req, res) {
    try {
      const { professorId } = req.params;

      const [totalAlunos, totalTurmas] = await Promise.all([
        this.countAlunosProfessor(professorId),
        this.countTurmasProfessor(professorId)
      ]);

      res.json({
        totalAlunos,
        totalTurmas
      });

    } catch (error) {
      console.error("Erro no dashboard professor:", error);
      res.status(500).json({ error: "Erro ao buscar dados do dashboard" });
    }
  }

  async countAlunosProfessor(professorId) {
    try {
      const result = await this.db.query(`
        SELECT COUNT(DISTINCT a.id_alunos) as total
        FROM professores p
        JOIN professores_turmas pt ON p.id_professores = pt.id_professor  
        JOIN turmas t ON pt.id_turma = t.id_turmas
        JOIN alunos_turmas at ON t.id_turmas = at.id_turma
        JOIN alunos a ON at.id_aluno = a.id_alunos
        WHERE p.id_professores = $1
      `, [professorId]);

      return parseInt(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error("Erro ao contar alunos:", error);
      return 0;
    }
  }

  async countTurmasProfessor(professorId) {
    try {
      const result = await this.db.query(`
        SELECT COUNT(*) as total
        FROM professores_turmas
        WHERE id_professor = $1
      `, [professorId]);

      return parseInt(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error("Erro ao contar turmas:", error);
      return 0;
    }
  }
}

export function createDashboardProfessorRouter(db, hashingService) {
  const router = express.Router();
  const controller = new DashboardProfessorController(db);

  router.use(createAuthMiddleware(hashingService));

  router.get("/professores/:professorId/dashboard", (req, res) => 
    controller.getDashboardData(req, res)
  );

  return router;
}