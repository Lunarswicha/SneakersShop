import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStockData() {
  try {
    console.log(' Ajout de donn√es de stock de test...');

    // R√cup√rer quelques produits pour les mettre √ jour avec des stocks vari√s
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        variants: true,
      },
    });

    console.log(` Mise √ jour de ${products.length} produits avec des stocks vari√s...`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Cr√er des sc√narios de stock vari√s
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

      // Mettre √ jour chaque variante
      for (let j = 0; j < product.variants.length; j++) {
        const variant = product.variants[j];
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stockQuantity: stockValues[j] },
        });
      }

      console.log(` ${product.name}: ${stockValues.join(', ')}`);
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

    console.log(' Statistiques finales:');
    console.log(`   - Total variantes: ${stats._count}`);
    console.log(`   - Stock total: ${stats._sum.stockQuantity || 0}`);
    console.log(`   - Stock faible: ${lowStock}`);
    console.log(`   - Rupture: ${outOfStock}`);

  } catch (error) {
    console.error(' Erreur lors de l\'ajout des donn√es de stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStockData();
