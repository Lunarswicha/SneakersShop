'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  
  useEffect(() => { 
    fetchCart();
  }, [user]);
  
  async function fetchCart() {
    try {
      console.log('🛒 Fetching cart, user:', user ? 'logged in' : 'not logged in');
      
      // Pour l'instant, utiliser toujours l'API de session pour simplifier
      console.log('👤 Fetching session cart from:', `${API_BASE}/cart-session`);
      
      // Récupérer l'ID de session depuis localStorage
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
      }
      
      const response = await fetch(`${API_BASE}/cart-session`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        }
      });
      
      console.log('👤 Session cart response status:', response.status);
      const data = await response.json();
      console.log('👤 Session cart data:', data);
      console.log('👤 Items count:', data.items?.length || 0);
      
      // Mettre à jour l'ID de session si nécessaire
      if (data.sessionId && data.sessionId !== sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
      }
      
      setItems(data.items || []);
      setSessionId(data.sessionId || sessionId);
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setItems([]);
    }
  }
  
  async function removeItem(itemId: number) {
    try {
      const sessionId = localStorage.getItem('sessionId');
      await fetch(`${API_BASE}/cart-session/${itemId}`, { 
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-Session-ID': sessionId || ''
        }
      });
      fetchCart(); // Refresh cart
    } catch (error) {
      alert('Failed to remove item');
    }
  }
  
  async function updateQuantity(itemId: number, quantity: number) {
    try {
      const sessionId = localStorage.getItem('sessionId');
      await fetch(`${API_BASE}/cart-session`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId || ''
        },
        credentials: 'include',
        body: JSON.stringify({ itemId: itemId, quantity })
      });
      fetchCart(); // Refresh cart
    } catch (error) {
      alert('Failed to update quantity');
    }
  }
  
  const total = items.reduce((s, i) => {
    // Pour les articles du panier d'authentification (avec variant)
    if (i.variant) {
      return s + Number(i.variant.price || i.variant.product?.basePrice || 0) * i.quantity;
    }
    // Pour les articles du panier de session (avec product)
    return s + Number(i.product?.basePrice || 0) * i.quantity;
  }, 0);
  
  async function checkout() {
    try {
      if (items.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Calculate total
      const total = items.reduce((s, i) => {
        return s + Number(i.product?.basePrice || 0) * i.quantity;
      }, 0);

      // Create fake payment session
      const response = await fetch(`${API_BASE}/payments/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          cartItems: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.product?.basePrice || 0
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }
      
      const { clientSecret, amount } = await response.json();
      
      // Redirect to payment page
      window.location.href = `/checkout?amount=${amount}&clientSecret=${clientSecret}`;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to proceed to checkout. Please try again.');
    }
  }

  // Show loading state
  if (loading) {
    return (
      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center py-16">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  // Show login prompt if not authenticated and no items in session cart
  if (!user && items.length === 0) {
    return (
      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary ripple"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="btn-secondary ripple"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Your Cart</h1>
        <p className="text-lg text-gray-600">
          {items.length === 0 ? 'Your cart is empty' : `${items.length} item${items.length === 1 ? '' : 's'} in your cart`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Looks like you haven't added any sneakers to your cart yet.</p>
          <a href="/products" className="btn-primary ripple">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((i, index) => (
              <div 
                key={i.id} 
                className="card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {(i.variant?.product?.images?.[0] || i.product?.images?.[0]) ? (
                      <img 
                        src={i.variant?.product?.images?.[0]?.imageUrl || i.product?.images?.[0]?.imageUrl} 
                        alt={i.variant?.product?.name || i.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">{i.variant?.product?.name || i.product?.name || 'Product'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Size: {i.variant?.size || i.size || 'N/A'}</span>
                      <span>•</span>
                      <span>Color: {i.variant?.color || i.color || 'N/A'}</span>
                      <span>•</span>
                      <span>Qty: {i.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gradient">
                      {(() => {
                        const price = i.variant?.price || i.variant?.product?.basePrice || i.product?.basePrice || 0;
                        return Number(price) * i.quantity;
                      })()}€
                    </div>
                    <div className="text-sm text-gray-500">
                      {(() => {
                        const price = i.variant?.price || i.variant?.product?.basePrice || i.product?.basePrice || 0;
                        return Number(price);
                      })()}€ each
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(i.productVariantId || i.id, i.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(i.productVariantId || i.id, i.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(i.productVariantId || i.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="card p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal</span>
                <span className="font-semibold">{total}€</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-gradient">{total}€</span>
                </div>
              </div>
            </div>

            <button 
              onClick={checkout} 
              className="btn-primary ripple w-full text-lg py-4 hover-glow"
            >
              Proceed to Payment
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
