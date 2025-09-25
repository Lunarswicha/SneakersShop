import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCartFrontend() {
  console.log('Test du panier frontend...\n');

  try {
    // 1. V�rifier qu'il y a des produits
    const products = await prisma.product.findMany({
      take: 3,
      include: { images: { where: { isPrimary: true }, take: 1 } }
    });
    
    console.log('Produits disponibles:');
    products.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id}): ${p.basePrice}`);
    });
    console.log('\n');

    // 2. Instructions de test
    console.log('Instructions de test:');
    console.log('   1. Ouvrez http://localhost:3000');
    console.log('   2. Allez sur /products');
    console.log('   3. Cliquez sur un produit (ex: MIZUNO Racer S)');
    console.log('   4. Ajoutez-le au panier');
    console.log('   5. Ouvrez la console du navigateur (F12)');
    console.log('   6. Allez sur /cart');
    console.log('   7. V�rifiez les logs dans la console');
    console.log('\n');

    // 3. Test de l'API directement
    console.log('Test de l\'API de session:');
    const response = await fetch('http://localhost:4000/api/cart-session');
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Items: ${data.items?.length || 0}`);
    console.log(`   Session ID: ${data.sessionId}`);
    console.log('\n');

    console.log('Test termin�. V�rifiez les logs dans la console du navigateur.');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCartFrontend();
