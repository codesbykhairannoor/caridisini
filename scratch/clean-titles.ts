import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Checking ${products.length} products...`);

  let updatedCount = 0;

  for (const product of products) {
    if (product.title.toLowerCase().startsWith('jual ')) {
      const newTitle = product.title.replace(/^jual\s+/i, '').trim();
      await prisma.product.update({
        where: { id: product.id },
        data: { title: newTitle }
      });
      console.log(`Updated ID ${product.id}: "${product.title}" -> "${newTitle}"`);
      updatedCount++;
    }
  }

  console.log(`Done! Updated ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
