import { Router } from 'express';
import { UsuarioService } from '../services/usuario.service.js';

export function createPublicRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const router = Router();

    router.post('/first-user', async (req, res) => {
        console.log('🎯 ROTA /public/first-user ACESSADA!');
        
        try {
            const usuarios = await usuarioService.list();
            console.log(`📊 Usuários existentes: ${usuarios.length}`);
            
            if (usuarios.length > 0) {
                return res.status(403).json({ 
                    error: 'Já existem usuários no sistema. Use o login normal.' 
                });
            }

            console.log('✅ Criando primeiro usuário...');
            const usuarioCriado = await usuarioService.create(req.body);
            
            console.log('🎉 Primeiro usuário criado com sucesso:', usuarioCriado.email);
            res.status(201).json({
                success: true,
                message: 'Primeiro usuário criado com sucesso!',
                usuario: {
                    id: usuarioCriado.id,
                    nome: usuarioCriado.nome,
                    email: usuarioCriado.email,
                    tipo_usuario: usuarioCriado.tipo_usuario
                }
            });
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            res.status(400).json({ 
                error: error.message,
                details: 'Verifique os dados enviados'
            });
        }
    });

    return router;
}