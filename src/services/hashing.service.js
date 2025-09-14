import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Serviço de hashing para senhas e outros dados sensíveis.
 * 
 * Atualmente utiliza bcrypt para garantir segurança, mas a separação em um serviço
 * permite fácil substituição por outro algoritmo de hashing no futuro, se necessário.
 * 
 * @example
 * const hashingService = new HashingService(jwtSecret);
 * const hashedPassword = await hashingService.hash('myPassword');
 * const isMatch = await hashingService.verify('myPassword', hashedPassword);
 *
 */
export class HashingService {
    /**
     * @param {string} jwtSecret - Segredo usado para assinar/verificar JWT
     * 
     * @throws {Error} Se jwtSecret não for fornecido
     */
    constructor(jwtSecret) {
        if (!jwtSecret) throw new Error("JWT_SECRET não definido");
        this.jwtSecret = jwtSecret;
    }

    /**
     * Hashes a given input string, typically used for passwords.
     * 
     * @param {string} input - The input string to hash
     * @returns {Promise<string>} The hashed output
     */
    async hash(input) {
        const saltRounds = 10;
        return await hash(input, saltRounds);
    }

    /**
     * Verifies if a given input matches the hashed output.
     * 
     * @param {string} input - The input string to verify
     * @param {string} hashedOutput - The previously hashed output to compare against
     * @returns {Promise<boolean>} True if the input matches the hash, false otherwise
     */
    async verify(input, hashedOutput) {
        return await compare(input, hashedOutput);
    }

    /**
     * Gera um token JWT a partir de um payload.
     * @param {object} payload - Dados a serem codificados no token
     * @param {string|number} [expiresIn='1h'] - Tempo de expiração do token
     * @returns {string} Token JWT
     */
    encodeJWT(payload, expiresIn = '1h') {
        const secret = this.jwtSecret;
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Decodifica e valida um token JWT.
     * @param {string} token
     * @returns {object} Payload decodificado
     * @throws {Error} Se o token for inválido
     */
    decodeJWT(token) {
        const secret = this.jwtSecret;
        return jwt.verify(token, secret);
    }
}