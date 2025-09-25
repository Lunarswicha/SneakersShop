import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCart() {
  try {
    console.log(' Test du syst�me de panier...\n');

    // Test 1: V�rifier les produits avec variantes
    console.log(' 1. Test des produits avec variantes:');
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {}
        }
      },
      include: {
        variants: {
          take: 3,
          select: {
            id: true,
            size: true,
            color: true,
            stockQuantity: true,
            price: true
          }
        },
        brand: {
          select: { name: true }
        }
      },
      take: 3
    });

    console.log(`    Produits avec variantes: ${productsWithVariants.length}`);
    productsWithVariants.forEach(product => {
      console.log(`   - ${product.name} (${product.brand?.name}): ${product.variants.length} variantes`);
    });

    // Test 2: V�rifier les produits sans variantes
    console.log('\n 2. Test des produits sans variantes:');
    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        variants: {
          none: {}
        }
      },
      include: {
        brand: {
          select: { name: true }
        }
      },
      take: 3
    });

    console.log(`    Produits sans variantes: ${productsWithoutVariants.length}`);
    productsWithoutVariants.forEach(product => {
      console.log(`   - ${product.name} (${product.brand?.name})`);
    });

    // Test 3: V�rifier les utilisateurs
    console.log('\n 3. Test des utilisateurs:');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });
    console.log(`    Utilisateurs: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    // Test 4: V�rifier les paniers existants
    console.log('\n 4. Test des paniers:');
    const cartItems = await prisma.shoppingCart.count();
    console.log(`    Articles dans les paniers: ${cartItems}`);

    console.log('\n Test termin� avec succ�s !');
    console.log('\n Instructions pour tester le panier:');
    console.log('   1. Allez sur http://localhost:3000/products');
    console.log('   2. Cliquez sur un produit pour voir les d�tails');
    console.log('   3. S�lectionnez une taille et une couleur');
    console.log('   4. Cliquez sur "Add to cart"');
    console.log('   5. Allez sur http://localhost:3000/cart pour voir le panier');
    console.log('   6. Connectez-vous avec admin@example.com / admin123');
    console.log('   7. Testez l\'ajout au panier en tant qu\'utilisateur connect�');

  } catch (error) {
    console.error(' Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCart();
