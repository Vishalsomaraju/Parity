import fs from 'fs';
import path from 'path';
import { getPool, closePool, isDegradedMode } from './connection';

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('[DB] Running database migrations...');
  try {
    const pool = getPool();
    await pool.query(sql);
    console.log('[DB] Migrations completed successfully.');
  } catch (err: any) {
    if (isDegradedMode()) {
      console.warn('[DB] Migration skipped: Running in degraded session mode.');
      return;
    }
    console.warn('[DB] Migration notice:', err.message);
  }
}

if (require.main === module) {
  runMigrations()
    .catch((err) => {
      console.error('[DB] Migration failed:', err);
    })
    .finally(() => closePool());
}
