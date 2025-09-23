'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading) {
      fetchCart();
    }
  }, [user, loading]);

  async function fetchCart() {
    try {
      // Always use session cart for simplicity
      const response = await fetch(`${API_BASE}/cart-session`, {
        credentials: 'include',
        headers: {
          'X-Session-ID': localStorage.getItem('sessionId') || ''
        }
      });
      const data = await response.json();
      setItems(data.items || []);
      
      const cartTotal = data.items.reduce((s: number, i: any) => {
        return s + Number(i.product?.basePrice || 0) * i.quantity;
      }, 0);
      setTotal(cartTotal);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setItems([]);
    }
  }

  async function processPayment() {
    setProcessing(true);
    try {
      // Simuler un processus de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une commande réussie
      const orderNumber = `ORD-${Date.now()}`;
      setOrderId(orderNumber);
      setAmount(total.toString());
      setPaymentStatus('success');
      
      // Clear the session cart
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        // Clear all items from session cart
        for (const item of items) {
          try {
            await fetch(`${API_BASE}/cart-session/${item.id}`, {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                'X-Session-ID': sessionId
              }
            });
          } catch (error) {
            console.error('Error clearing cart item:', error);
          }
        }
      }
      
      showNotification('Payment successful! Your order has been confirmed.', 'success');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      showNotification('Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  }

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

  // Show checkout form
  if (paymentStatus === 'processing' && !processing) {
    return (
      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gradient">Checkout</h1>
          <p className="text-lg text-gray-600">Complete your purchase</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button onClick={() => router.push('/products')} className="btn-primary ripple">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.product?.images?.[0] ? (
                          <img 
                            src={item.product.images[0].imageUrl} 
                            alt={item.product.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {(Number(item.product?.basePrice || 0) * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-gradient">{total.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="text-center">
              <button
                onClick={processPayment}
                disabled={processing}
                className="btn-primary ripple text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ${total.toFixed(2)}€`
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Checkout</h1>
        <p className="text-lg text-gray-600">Complete your purchase</p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {(item.variant?.product?.images?.[0] || item.product?.images?.[0]) ? (
                    <img 
                      src={item.variant?.product?.images?.[0]?.imageUrl || item.product?.images?.[0]?.imageUrl} 
                      alt={item.variant?.product?.name || item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.variant?.product?.name || item.product?.name || 'Product'}</h3>
                  <p className="text-sm text-gray-600">
                    Size: {item.variant?.size || item.size || 'N/A'} • 
                    Color: {item.variant?.color || item.color || 'N/A'} • 
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(() => {
                      const price = item.variant?.price || item.variant?.product?.basePrice || item.product?.basePrice || 0;
                      return Number(price) * item.quantity;
                    })()}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Payment Details</h2>
          
          <div className="card p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456" 
                className="input w-full"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="input w-full"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">CVV</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  className="input w-full"
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="input w-full"
                disabled
              />
            </div>
          </div>

          {/* Order Total */}
          <div className="card p-6 space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{total.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <button
            onClick={processPayment}
            disabled={processing || items.length === 0}
            className="btn-primary ripple w-full text-lg py-4 hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing Payment...
              </div>
            ) : (
              <>
                Complete Payment
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center">
            This is a demo checkout. No real payment will be processed.
          </p>
        </div>
      </div>
    </section>
  );
}