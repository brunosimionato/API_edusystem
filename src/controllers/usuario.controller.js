// src/controllers/usuario.controller.js
import { Router } from "express";
import { UsuarioService } from "../services/usuario.service.js";
import { SecretariaService } from "../services/secretaria.service.js";
import { createAuthMiddleware } from "./auth.middleware.js";

/**
 * Cria e retorna um router de usuário
 */
export function createUsuarioRouter(db, hashingService) {
    const usuarioService = new UsuarioService(db, hashingService);
    const secretariaService = new SecretariaService(db, usuarioService);
    const router = Router();

    // =========================================================
    // 🔓 ROTA PÚBLICA - PRIMEIRO USUÁRIO DO SISTEMA
    // =========================================================
    router.post("/public", async (req, res) => {
        const novoUsuario = req.body;

        try {
            const usuariosExistentes = await usuarioService.list();

            // Bloqueia criação automática após primeiro usuário
            if (usuariosExistentes.length > 0) {
                return res.status(403).json({
                    error: "Criação pública desativada. Use uma conta existente."
                });
            }

            const usuarioCriado = await usuarioService.create(novoUsuario);
            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error("Erro na criação pública:", error);
            res.status(400).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 A PARTIR DAQUI, TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
    // =========================================================
    router.use(createAuthMiddleware(hashingService));

    // =========================================================
    // 🔐 LISTAR TODOS OS USUÁRIOS (ativos e inativos)
    // =========================================================
    router.get("/", async (req, res) => {
        try {
            const usuarios = await usuarioService.list();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 BUSCAR USUÁRIO POR ID
    // =========================================================
    router.get("/:id", async (req, res) => {
        try {
            const usuario = await usuarioService.getById(req.params.id);

            if (!usuario) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }

            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 CRIAR NOVO USUÁRIO (somente autenticado)
    // =========================================================
    router.post("/", async (req, res) => {
        const novoUsuario = req.body;

        try {
            // 1️⃣ cria o usuário na tabela usuarios
            const usuarioCriado = await usuarioService.create(novoUsuario);

            // 2️⃣ Criar entidade automaticamente se for SECRETARIA
            if (novoUsuario.tipo_usuario === "secretaria") {
                await secretariaService.create({
                    idUsuario: usuarioCriado.id
                });
                console.log(`✅ Secretaria criada (idUsuario: ${usuarioCriado.id})`);
            }

            res.status(201).json(usuarioCriado);
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            res.status(400).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 EDITAR USUÁRIO
    // =========================================================
    router.put("/:id", async (req, res) => {
        try {
            const usuarioAtualizado = await usuarioService.update(req.params.id, req.body);
            res.json(usuarioAtualizado);
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 INATIVAR (DELETE lógico)
    // =========================================================
    router.delete("/:id", async (req, res) => {
        try {
            await usuarioService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    // =========================================================
    // 🔐 REATIVAR USUÁRIO
    // =========================================================
    router.put("/:id/ativar", async (req, res) => {
        try {
            const usuarioReativado = await usuarioService.reativar(req.params.id);
            res.status(200).json(usuarioReativado);
        } catch (error) {
            if (error.message === "Usuário não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}
