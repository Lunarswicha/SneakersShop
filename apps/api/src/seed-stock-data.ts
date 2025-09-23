import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStockData() {
  try {
    console.log('🔄 Ajout de données de stock de test...');

    // Récupérer quelques produits pour les mettre à jour avec des stocks variés
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        variants: true,
      },
    });

    console.log(`📦 Mise à jour de ${products.length} produits avec des stocks variés...`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Créer des scénarios de stock variés
      let stockValues: number[];
      
      if (i < 3) {
        // Produits en rupture de stock
        stockValues = product.variants.map(() => 0);
      } else if (i < 6) {
        // Produits avec stock faible
        stockValues = product.variants.map(() => Math.floor(Math.random() * 10));
      } else {
        // Produits avec stock normal
        stockValues = product.variants.map(() => Math.floor(Math.random() * 50) + 10);
      }

      // Mettre à jour chaque variante
      for (let j = 0; j < product.variants.length; j++) {
        const variant = product.variants[j];
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stockQuantity: stockValues[j] },
        });
      }

      console.log(`✅ ${product.name}: ${stockValues.join(', ')}`);
    }

    // Afficher les statistiques finales
    const stats = await prisma.productVariant.aggregate({
      _sum: { stockQuantity: true },
      _count: true,
    });

    const lowStock = await prisma.productVariant.count({
      where: { stockQuantity: { lt: 10, gt: 0 } },
    });

    const outOfStock = await prisma.productVariant.count({
      where: { stockQuantity: 0 },
    });

    console.log('📊 Statistiques finales:');
    console.log(`   - Total variantes: ${stats._count}`);
    console.log(`   - Stock total: ${stats._sum.stockQuantity || 0}`);
    console.log(`   - Stock faible: ${lowStock}`);
    console.log(`   - Rupture: ${outOfStock}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStockData();
