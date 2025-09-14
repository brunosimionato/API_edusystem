import { Router } from 'express';

import { LoginCredentials } from '../entities/auth.js'
import { AuthService } from '../services/auth.service.js';
import { UsuarioService } from '../services/usuario.service.js';
import { AlunoService } from '../services/aluno.service.js';
import { ProfessorService } from '../services/professor.service.js';
import { SecretariaService } from '../services/secretaria.service.js';

/**
 * Cria e retorna um router de autenticação
 * 
 * @param {import('../db/index.js').PoolClient} db
 * @param {HashingService} hashingService
 * 
 * @returns {Router}
 */
export function createAuthRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);

    const authService = new AuthService(
        usuarioService,
        hashingService,
        new AlunoService(db, usuarioService),
        new ProfessorService(db, usuarioService),
        new SecretariaService(db, usuarioService)
    );
    const router = Router();

    router.post('/login', async (req, res) => {
        const credentials = LoginCredentials.fromObj({
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
        });

        try {
            const token = await authService.login(credentials);
            res.json({ token });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    });

    return router
}
