// src/controllers/auth.middleware.js
/**
 * Middleware de autenticação JWT.
 */
export function createAuthMiddleware(hashingService) {
    return (req, res, next) => {
        // Log para debug
        console.log('🔐 Middleware de autenticação executado para:', req.path);
        console.log('Headers:', req.headers);

        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            console.log('❌ Authorization header missing');
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.replace(/^Bearer\s+/i, '');
        
        if (!token) {
            console.log('❌ Token missing');
            return res.status(401).json({ error: 'Token missing' });
        }

        try {
            // Decodifica e valida o token JWT
            console.log('🔍 Validando token...');
            const payload = hashingService.decodeJWT(token);
            
            req.context = req.context || {};
            req.context.token = token;
            req.context.user = payload;
            
            console.log('✅ Token válido para usuário:', payload.usuario?.email);
            next();
        } catch (err) {
            console.log('❌ Token inválido:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}