import fs from 'fs';
import path from 'path';

const sqlPath = path.join(process.cwd(), 'prisma', 'migration.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Filter out non-ASCII or BOM characters and ensure it's just plain string
const cleaned = content.replace(/[^\x20-\x7E\r\n\t]/g, '');

fs.writeFileSync(sqlPath, cleaned, 'utf8');
console.log("SQL file cleaned of BOM/extra characters! ✅");
