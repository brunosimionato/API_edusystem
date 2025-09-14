/** @typedef {import("pg").PoolClient} PoolClient */
import { Pool } from "pg";


/** @type {Pool} */
let pool

/**
 * Função utilizada para obter uma conexão ao banco
 * @returns {Promise<PoolClient>} 
 */
export async function get_db() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.CONNECTION_STRING
        });
    }

    const client = await pool.connect();

    return client
}

/**
 * Função utilizada para liberar a conexão ao banco
 * @returns {Promise<void>}
 */
export async function cleanup() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
