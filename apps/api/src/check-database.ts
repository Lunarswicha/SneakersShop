import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database...');
  
  // Count total products
  const totalProducts = await prisma.product.count();
  console.log(`📊 Total products in database: ${totalProducts}`);
  
  // Get some recent products
  const recentProducts = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      brand: true,
      images: true
    }
  });
  
  console.log('\n📋 Recent products:');
  recentProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ${product.brand?.name} - ${product.images[0]?.imageUrl?.substring(0, 50)}...`);
  });
  
  // Check for KicksCrew products
  const kickscrewProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Tech Fleece' } },
        { name: { contains: 'Yeezy' } },
        { name: { contains: 'Samba' } }
      ]
    },
    include: {
      brand: true,
      images: true
    }
  });
  
  console.log(`\n🎯 Found ${kickscrewProducts.length} KicksCrew products:`);
  kickscrewProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ${product.brand?.name}`);
  });
}

checkDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



