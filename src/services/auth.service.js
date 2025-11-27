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
        console.log("🔐 DEBUG BACKEND - Iniciando login para:", credentials.email);
        
        const usuario = await this.usuarioService.getByEmail(credentials.email);

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        console.log("✅ DEBUG BACKEND - Usuário encontrado:", {
            id: usuario.id,
            email: usuario.email, 
            tipo_usuario: usuario.tipo_usuario
        });

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
            console.log("🎯 DEBUG BACKEND - Buscando professor para usuarioId:", usuario.id);
            console.log("🔍 ProfessorService disponível:", !!this.professorService);
            
            entityService = this.professorService;
            
            if (this.professorService) {
                console.log("🔍 Método getByUsuarioId disponível:", typeof this.professorService.getByUsuarioId);
            }
        } else if (usuario.tipo_usuario === 'secretaria') {
            entityService = this.secretariaService;
        } else {
            throw new Error('Role inválida');
        }

        console.log("🔍 DEBUG BACKEND - EntityService selecionado:", usuario.tipo_usuario);
        
        const entity = await entityService.getByUsuarioId(usuario.id);
        
        console.log("🔍 DEBUG BACKEND - Entidade encontrada:", entity);

        if (!entity) {
            console.log("❌ DEBUG BACKEND - Entidade NÃO encontrada para usuarioId:", usuario.id);
            console.log("🔍 DEBUG BACKEND - Tipo de usuário:", usuario.tipo_usuario);
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

        console.log("✅ DEBUG BACKEND - Login bem-sucedido, token gerado");
        return token;
    }
}