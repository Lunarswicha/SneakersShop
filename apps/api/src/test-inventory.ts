import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInventory() {
  try {
    console.log('🧪 Test du système de gestion des stocks...');

    // Test 1: Compter les produits et variantes
    const productCount = await prisma.product.count();
    const variantCount = await prisma.productVariant.count();
    const totalStock = await prisma.productVariant.aggregate({
      _sum: { stockQuantity: true },
    });

    console.log('📊 Statistiques de base:');
    console.log(`   - Produits: ${productCount}`);
    console.log(`   - Variantes: ${variantCount}`);
    console.log(`   - Stock total: ${totalStock._sum.stockQuantity || 0}`);

    // Test 2: Trouver des produits avec stock faible
    const lowStockProducts = await prisma.product.findMany({
      where: {
        variants: {
          some: {
            stockQuantity: { lt: 10, gt: 0 },
          },
        },
      },
      include: {
        brand: true,
        variants: {
          where: { stockQuantity: { lt: 10, gt: 0 } },
        },
      },
      take: 5,
    });

    console.log('\n⚠️  Produits avec stock faible:');
    lowStockProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.brand?.name}): ${product.variants.length} variantes en stock faible`);
    });

    // Test 3: Trouver des produits en rupture
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        variants: {
          every: { stockQuantity: 0 },
        },
      },
      include: {
        brand: true,
        variants: true,
      },
      take: 5,
    });

    console.log('\n❌ Produits en rupture de stock:');
    outOfStockProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.brand?.name}): ${product.variants.length} variantes`);
    });

    // Test 4: Statistiques par marque
    const brandStats = await prisma.brand.findMany({
      include: {
        products: {
          include: {
            variants: {
              select: { stockQuantity: true },
            },
          },
        },
      },
    });

    console.log('\n🏷️  Statistiques par marque:');
    brandStats.forEach(brand => {
      const totalStock = brand.products.reduce((sum, product) => 
        sum + product.variants.reduce((variantSum, variant) => variantSum + variant.stockQuantity, 0), 0
      );
      console.log(`   - ${brand.name}: ${totalStock} unités en stock`);
    });

    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInventory();
