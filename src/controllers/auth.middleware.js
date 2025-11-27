/**
 * Middleware de autenticação JWT.
 */
export function createAuthMiddleware(hashingService) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }

        const token = authHeader.replace(/^Bearer\s+/i, '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token missing' });
        }

        try {
            const payload = hashingService.decodeJWT(token);
            
            req.context = req.context || {};
            req.context.token = token;
            req.context.user = payload;
            
            next();
        } catch (err) {
            console.log('❌ Auth failed');
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}