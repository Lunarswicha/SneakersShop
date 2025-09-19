import { prisma } from './lib/prisma.js';

async function main() {
  const count = await prisma.productImage.deleteMany({});
  console.log(`Removed ${count.count} product images.`);
}

main().finally(() => prisma.$disconnect());








