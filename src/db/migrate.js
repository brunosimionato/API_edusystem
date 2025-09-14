import { readFileSync } from 'node:fs'
import path from 'node:path';


/**
 * Função utilizada para criar as tabelas do banco de dados
 * 
 * @throws essa função pode falhar se o arquivo de migrações não
 * existir ou caso ocorra algum problema na conexão com o banco
 * 
 * @returns {Promise<void>}
 */
export async function migrate(conn) {
    if (process.env.MIGRATE_DB !== "true") {
        console.log("Migrações desativadas");
        return;
    }

    const migrations = readFileSync(
        path.join(process.cwd(), "src", "db", "migrations", "0001.sql")
    )

    await conn.query(migrations.toString())
}