const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    include: { category: true },
    take: 5
  });
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}

check();
