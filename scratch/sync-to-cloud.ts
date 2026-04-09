import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing Turso environment variables.");
  process.exit(1);
}

const localDbPath = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db');
const localDb = new Database(localDbPath);
const turso = createClient({ url, authToken });

async function migrate() {
  console.log("Starting data migration to Turso... 🐙");

  // 1. Clear Turso tables (Truncate equivalent for SQLite/libSQL)
  console.log("Cleaning Turso data for a fresh sync...");
  await turso.execute("DELETE FROM Product");
  await turso.execute("DELETE FROM Category");

  // 2. Fetch Categories from Local
  const categories = localDb.prepare("SELECT * FROM Category").all() as any[];
  console.log(`Found ${categories.length} categories locally.`);

  // 3. Insert Categories to Turso
  for (const cat of categories) {
    console.log(`Syncing category: ${cat.name}`);
    await turso.execute({
      sql: "INSERT INTO Category (id, name, slug, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
      args: [cat.id, cat.name, cat.slug, cat.createdAt, cat.updatedAt]
    });
  }

  // 4. Fetch Products from Local
  const products = localDb.prepare("SELECT * FROM Product").all() as any[];
  console.log(`Found ${products.length} products locally.`);

  // 5. Insert Products to Turso
  for (const prod of products) {
    console.log(`Syncing product: ${prod.title.substring(0, 30)}...`);
    await turso.execute({
      sql: `INSERT INTO Product (
        id, title, description, imageUrl, images, originalPrice, price, 
        shopeeUrl, clicks, categoryId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        prod.id, 
        prod.title, 
        prod.description, 
        prod.imageUrl, 
        prod.images, 
        prod.originalPrice, 
        prod.price, 
        prod.shopeeUrl, 
        prod.clicks, 
        prod.categoryId, 
        prod.createdAt, 
        prod.updatedAt
      ]
    });
  }

  console.log("\nMigration completed successfully! 🎉✨");
  console.log("Local data has been mirrored to the Turso cloud.");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
