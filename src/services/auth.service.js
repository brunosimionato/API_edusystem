import { LoginCredentials } from '../entities/auth.js';

import { UsuarioService } from './usuario.service.js';
import { HashingService } from './hashing.service.js';
import { AlunoService } from './aluno.service.js';
import { ProfessorService } from './professor.service.js';
import { SecretariaService } from './secretaria.service.js';

export class AuthService {
    /**
     * @param {UsuarioService} usuarioService
     * @param {HashingService} hashingService
     * @param {AlunoService} alunoService
     * @param {ProfessorService} professorService
     * @param {SecretariaService} secretariaService
     */
    constructor(usuarioService, hashingService, alunoService, professorService, secretariaService) {
        this.usuarioService = usuarioService;
        this.hashingService = hashingService;
        this.alunoService = alunoService;
        this.professorService = professorService;
        this.secretariaService = secretariaService;
    }


    /**
     * Realiza o login de um usuário
     * 
     * @param {LoginCredentials} credentials
     * 
     * @returns {Promise<string>} Token JWT contendo as informações do usuário
     * @throws {Error} Se as credenciais forem inválidas
     */
    async login(credentials) {
        const usuario = await this.usuarioService.getByEmail(credentials.email);

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        const passwordMatch = await this.hashingService.verify(
            credentials.password,
            usuario.hash_senha
        );

        if (!passwordMatch) {
            throw new Error('Credenciais inválidas');
        }

        if (usuario.tipo_usuario !== credentials.role) {
            throw new Error('Role inválida para este usuário');
        }

        let entityService;
        if (usuario.tipo_usuario === 'aluno') {
            entityService = this.alunoService;
        } else if (usuario.tipo_usuario === 'professor') {
            entityService = this.professorService;
        } else if (usuario.tipo_usuario === 'secretaria') {
            entityService = this.secretariaService;
        } else {
            throw new Error('Role inválida');
        }

        const entity = await entityService.getByUsuarioId(usuario.id);

        if (!entity) {
            throw new Error('Entidade não encontrada para este usuário');
        }

        // Cria o payload do JWT, removendo hash_senha
        const payload = {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario,
            },
            entity: { ...entity, usuario: undefined },
            role: credentials.role
        };

        const token = this.hashingService.encodeJWT(payload, '24h');

        return token;
    }
}
