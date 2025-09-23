import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initStock() {
  try {
    console.log('🔄 Initialisation des stocks...');

    // Récupérer tous les produits avec leurs variantes
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
    });

    console.log(`📦 Trouvé ${products.length} produits`);

    // Mettre à jour les stocks avec des valeurs aléatoires
    for (const product of products) {
      for (const variant of product.variants) {
        // Générer un stock aléatoire entre 0 et 50
        const randomStock = Math.floor(Math.random() * 51);
        
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stockQuantity: randomStock },
        });
      }
    }

    // Calculer les statistiques finales
    const totalVariants = await prisma.productVariant.count();
    const totalStock = await prisma.productVariant.aggregate({
      _sum: { stockQuantity: true },
    });
    const lowStockVariants = await prisma.productVariant.count({
      where: { stockQuantity: { lt: 10, gt: 0 } },
    });
    const outOfStockVariants = await prisma.productVariant.count({
      where: { stockQuantity: 0 },
    });

    console.log('✅ Stocks initialisés avec succès !');
    console.log('📊 Statistiques:');
    console.log(`   - Total variantes: ${totalVariants}`);
    console.log(`   - Stock total: ${totalStock._sum.stockQuantity || 0}`);
    console.log(`   - Stock faible (< 10): ${lowStockVariants}`);
    console.log(`   - Rupture de stock: ${outOfStockVariants}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des stocks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initStock();
