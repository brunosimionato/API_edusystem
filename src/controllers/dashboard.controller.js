import express from 'express';
import { createAuthMiddleware } from './auth.middleware.js';

export class DashboardController {
  constructor(db) {
    this.db = db;
  }

  async getResumo(req, res) {
    try {
      const [alunos, professores, turmas, disciplinas] = await Promise.all([
        this.db.query("SELECT COUNT(*) AS total FROM alunos"),

        this.db.query(`
          SELECT COUNT(*) AS total
          FROM professores p
          INNER JOIN usuarios u ON u.id_usuarios = p.id_usuario
          WHERE u.ativo = true
        `),

        this.db.query("SELECT COUNT(*) AS total FROM turmas"),
        this.db.query("SELECT COUNT(*) AS total FROM disciplinas")
      ]);

      res.json({
        alunos: parseInt(alunos.rows[0].total),
        professores: parseInt(professores.rows[0].total),
        turmas: parseInt(turmas.rows[0].total),
        disciplinas: parseInt(disciplinas.rows[0].total)
      });
    } catch (error) {
      console.error("Erro no dashboard:", error);
      res.status(500).json({ error: "Erro ao buscar dados do painel" });
    }
  }
}

export function createDashboardRouter(db, hashingService) {
  const router = express.Router();
  const controller = new DashboardController(db);

  router.use(createAuthMiddleware(hashingService));

  router.get("/", (req, res) => controller.getResumo(req, res));

  return router;
}
