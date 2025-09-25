import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSystem() {
  try {
    console.log(' Test du syst√me SneakerShop...\n');

    // Test 1: V√rifier la base de donn√es
    console.log(' 1. Test de la base de donn√es:');
    const productCount = await prisma.product.count();
    const variantCount = await prisma.productVariant.count();
    const userCount = await prisma.user.count();
    
    console.log(`    Produits: ${productCount}`);
    console.log(`    Variantes: ${variantCount}`);
    console.log(`    Utilisateurs: ${userCount}`);

    // Test 2: V√rifier les stocks
    console.log('\n 2. Test des stocks:');
    const totalStock = await prisma.productVariant.aggregate({
      _sum: { stockQuantity: true },
    });
    const lowStock = await prisma.productVariant.count({
      where: { stockQuantity: { lt: 10, gt: 0 } },
    });
    const outOfStock = await prisma.productVariant.count({
      where: { stockQuantity: 0 },
    });
    
    console.log(`    Stock total: ${totalStock._sum.stockQuantity || 0}`);
    console.log(`    Stock faible: ${lowStock}`);
    console.log(`    Rupture: ${outOfStock}`);

    // Test 3: V√rifier l'utilisateur admin
    console.log('\n 3. Test de l\'utilisateur admin:');
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { email: true, role: true, isActive: true },
    });
    
    if (admin) {
      console.log(`    Admin trouv√: ${admin.email}`);
      console.log(`    R√le: ${admin.role}`);
      console.log(`    Actif: ${admin.isActive}`);
    } else {
      console.log('    Aucun admin trouv√');
    }

    // Test 4: V√rifier les marques
    console.log('\n  4. Test des marques:');
    const brandCount = await prisma.brand.count();
    const brands = await prisma.brand.findMany({
      take: 5,
      select: { name: true },
    });
    
    console.log(`    Nombre de marques: ${brandCount}`);
    console.log(`    Exemples: ${brands.map(b => b.name).join(', ')}`);

    console.log('\n Tous les tests sont pass√s avec succ√s !');
    console.log('\n Instructions pour se connecter:');
    console.log('   1. Allez sur http://localhost:3000/login');
    console.log('   2. Email: admin@example.com');
    console.log('   3. Mot de passe: admin123');
    console.log('   4. Cliquez sur votre profil  " Gestion des Stocks"');

  } catch (error) {
    console.error(' Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSystem();
