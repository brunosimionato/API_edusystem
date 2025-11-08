/** @typedef {import("pg").Pool} Pool */
import { Pool } from "pg";

/** @type {Pool | null} */
let pool = null;

/**
 * Retorna o pool de conexões do banco de dados.
 * NÃO retorna um client aqui!
 * @returns {Pool}
 */
export function get_db() {
    if (!pool) {
        console.log("CONNECTION_STRING:", process.env.CONNECTION_STRING);

        pool = new Pool({
            connectionString: process.env.CONNECTION_STRING,
        });
    }

    return pool; // <-- Retorna o pool (correto!)
}

/**
 * Fecha o pool ao finalizar a aplicação
 */
export async function cleanup() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
