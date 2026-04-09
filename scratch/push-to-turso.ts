import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  const sqlPath = path.join(process.cwd(), 'prisma', 'migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split the SQL into individual statements
  // This is a basic split, might need more refinement if there are complex triggers
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} statements on Turso...`);

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 50)}...`);
    await client.execute(statement);
  }

  console.log("Successfully pushed schema to Turso! 🐙✨");
}

main().catch(err => {
  console.error("Error pushing to Turso:", err);
  process.exit(1);
});
