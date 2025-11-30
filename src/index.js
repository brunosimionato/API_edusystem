import express from "express";
import { config } from "dotenv"
import cors from "cors";

import { migrate } from "./db/migrate.js";
import { seed } from "./db/seed.js";
import { get_db } from "./db/index.js";

import { createUsuarioRouter } from "./controllers/usuario.controller.js";
import { createAlunoRouter } from "./controllers/aluno.controller.js";
import { createProfessorRouter } from "./controllers/professor.controller.js";
import { createSecretariaRouter } from "./controllers/secretaria.controller.js";
import { createAuthRouter } from "./controllers/auth.controller.js";
import { createDisciplinaRouter } from "./controllers/disciplina.controller.js";
import { createTurmaRouter } from "./controllers/turma.controller.js";
import { createHistoricoEscolarRouter } from "./controllers/historico_escolar.controller.js";
import { HashingService } from "./services/hashing.service.js";
import { createNotaRouter } from './controllers/nota.controller.js';
import { createFaltaRouter } from './controllers/falta.controller.js';
import { createHorarioRouter } from './controllers/horario.controller.js';
import { createDashboardRouter } from './controllers/dashboard.controller.js';
import { createDashboardProfessorRouter } from './controllers/dashboardProfesor.controller.js';

config()

const port = process.env.PORT;

const db = await get_db();
console.log("Conexão com o banco de dados estabelecida");
const hashingService = new HashingService(process.env.JWT_SECRET);

await migrate(db);
await seed(db, hashingService);

const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Funcionando"
    })
})

app.post('/public/first-user', async (req, res) => {
    try {
        const { UsuarioService } = await import('./services/usuario.service.js');
        const usuarioService = new UsuarioService(db, hashingService);

        // Verifica se já existe algum usuário
        const usuarios = await usuarioService.list();

        if (usuarios.length > 0) {
            return res.status(403).json({
                error: 'Já existem usuários no sistema. Use o login normal.'
            });
        }

        const usuarioCriado = await usuarioService.create(req.body);

        res.status(201).json({
            message: 'Primeiro usuário criado com sucesso!',
            usuario: usuarioCriado
        });
    } catch (error) {
        console.error('❌ Erro:', error);
        res.status(400).json({ error: error.message });
    }
});

// Outras rotas
app.use('/usuarios', createUsuarioRouter(db, hashingService));
app.use('/auth', createAuthRouter(db, hashingService));
app.use('/alunos', createAlunoRouter(db, hashingService));
app.use('/professores', createProfessorRouter(db, hashingService));
app.use('/secretarias', createSecretariaRouter(db, hashingService));
app.use('/disciplinas', createDisciplinaRouter(db, hashingService));
app.use('/turmas', createTurmaRouter(db, hashingService));
app.use('/historicos-escolares', createHistoricoEscolarRouter(db, hashingService));
app.use('/notas', createNotaRouter(db, hashingService));
app.use('/faltas', createFaltaRouter(db, hashingService));
app.use('/horarios', createHorarioRouter(db, hashingService));
app.use('/api/dashboard', createDashboardRouter(db, hashingService));
app.use('/api', createDashboardProfessorRouter(db, hashingService));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});