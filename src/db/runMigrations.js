// Crie um script para executar migrações manualmente
// db/runMigrations.js
import { get_db } from './index.js';
import { migrate } from './migrate.js';

async function runMigrations() {
    const db = await get_db();
    try {
        await migrate(db);
        console.log('✅ Migrações executadas com sucesso!');
    } catch (error) {
        console.error('❌ Erro nas migrações:', error);
    } finally {
        await db.release();
    }
}

runMigrations();