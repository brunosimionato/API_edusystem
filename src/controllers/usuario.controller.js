// src/controllers/usuario.controller.js
import { Router } from 'express';
import { UsuarioService } from '../services/usuario.service.js';
import { createAuthMiddleware } from './auth.middleware.js';

/**
 * Cria e retorna um router de usuário
 */
export function createUsuarioRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const router = Router();

    // 🔓 ROTA PÚBLICA - DEVE VIR ANTES de QUALQUER middleware
    router.post('/public', async (req, res) => {
        console.log('📨 Recebida requisição para /usuarios/public');
        
        const novoUsuario = req.body;

        try {
            console.log('Dados recebidos:', { 
                email: novoUsuario.email, 
                tipo: novoUsuario.tipo_usuario,
                nome: novoUsuario.nome 
            });
            
            // Verifica se já existe algum usuário no sistema
            const usuarios = await usuarioService.list();
            console.log(`Número de usuários existentes: ${usuarios.length}`);
            
            // Se já existirem usuários, não permite criação pública
            if (usuarios.length > 0) {
                console.log('❌ Tentativa de criação pública bloqueada - já existem usuários');
                return res.status(403).json({ 
                    error: 'Criação pública de usuários desativada. Use uma conta existente.' 
                });
            }

            console.log('✅ Criando primeiro usuário do sistema...');
            const usuarioCriado = await usuarioService.create(novoUsuario);
            
            console.log('✅ Usuário criado com sucesso:', usuarioCriado.email);
            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error('❌ Erro na criação pública de usuário:', error);
            res.status(400).json({ error: error.message });
        }
    });

    // 🔐 A PARTIR DAQUI, TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
    // Aplica o middleware de autenticação APENAS para as rotas abaixo
    router.use(createAuthMiddleware(hashingService));

    // 🔐 ROTAS PROTEGIDAS
    router.get('/', async (req, res) => {
        try {
            console.log('📋 Listando usuários (usuário autenticado)');
            const usuarios = await usuarioService.list();
            res.json(usuarios);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const usuario = await usuarioService.getById(req.params.id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/', async (req, res) => {
        const novoUsuario = req.body;
        try {
            console.log('👤 Criação de usuário por usuário autenticado:', req.context.user);
            const usuarioCriado = await usuarioService.create(novoUsuario);
            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error('Erro na criação de usuário:', error);
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const updateData = req.body;
        try {
            const usuarioAtualizado = await usuarioService.update(id, updateData);
            res.json(usuarioAtualizado);
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        try {
            await usuarioService.delete(id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}