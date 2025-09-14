import { z } from 'zod';

const novoSecretariaSchema = z.object({
    idUsuario: z.number()
});

const secretariaSchema = z.object({
    id: z.number(),
    idUsuario: z.number()
});

// Representa uma nova secretaria a ser criada (antes de existir no banco)
export class NovoSecretaria {
    /**
     * @param {{
     *   idUsuario: number
     * }} obj
     */
    constructor(obj) {
        const validated = novoSecretariaSchema.parse(obj);
        this.idUsuario = validated.idUsuario;
    }

    /**
     * Cria uma instância de NovoSecretaria a partir de um objeto
     * @param {Object} obj
     * @returns {NovoSecretaria}
     */
    static fromObj(obj) {
        return new NovoSecretaria(obj);
    }
}

// Representa uma secretaria existente no banco
export class Secretaria {
    /**
     * @param {{
     *   id: number,
     *   idUsuario: number
     * }} obj
     */
    constructor(obj) {
        const validated = secretariaSchema.parse(obj);
        this.id = validated.id;
        this.idUsuario = validated.idUsuario;
    }

    /**
     * Cria uma instância de Secretaria a partir de uma linha do banco de dados
     * @param {Object} row
     * @param {number} idUsuario
     * @returns {Secretaria}
     */
    static fromRow(row, idUsuario) {
        return new Secretaria({
            id: row.id_secretaria,
            idUsuario,
        });
    }

    /**
     * Cria uma instância de Secretaria a partir de um objeto
     * @param {Object} obj
     * @returns {Secretaria}
     */
    static fromObj(obj) {
        return new Secretaria(obj);
    }
}
