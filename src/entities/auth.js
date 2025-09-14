import { z } from 'zod';

const loginCredentialsSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.string()
});

export class LoginCredentials {
    /**
     * @param {{
     *   email: string,
     *   password: string,
     *   role: string
     * }} obj
     */
    constructor(obj) {
        const validated = loginCredentialsSchema.parse(obj);
        this.email = validated.email;
        this.password = validated.password;
        this.role = validated.role;
    }

    /**
     * Cria uma instância de LoginCredentials a partir de um objeto
     * @param {Object} obj
     * @returns {LoginCredentials}
     */
    static fromObj(obj) {
        return new LoginCredentials(obj);
    }
}