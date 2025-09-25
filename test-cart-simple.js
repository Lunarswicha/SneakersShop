// Test simple du panier
const API_BASE = 'http://localhost:4000/api';

async function testCart() {
  console.log('Test du panier...');
  
  try {
    // 1. R�cup�rer le panier
    console.log('1. R�cup�ration du panier...');
    const getResponse = await fetch(`${API_BASE}/cart-session`, {
      headers: { 'X-Session-ID': 'test-session-123' }
    });
    const cartData = await getResponse.json();
    console.log('Panier actuel:', cartData);
    
    // 2. Ajouter un produit
    console.log('2. Ajout d\'un produit...');
    const addResponse = await fetch(`${API_BASE}/cart-session`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      },
      body: JSON.stringify({
        productId: 744,
        quantity: 1,
        size: '42',
        color: 'Silver Grey'
      })
    });
    const addData = await addResponse.json();
    console.log('Produit ajout�:', addData);
    
    // 3. V�rifier le panier
    console.log('3. V�rification du panier...');
    const finalResponse = await fetch(`${API_BASE}/cart-session`, {
      headers: { 'X-Session-ID': 'test-session-123' }
    });
    const finalData = await finalResponse.json();
    console.log('Panier final:', finalData);
    
    console.log(' Test termin� avec succ�s!');
    
  } catch (error) {
    console.error(' Erreur:', error);
  }
}

testCart();
