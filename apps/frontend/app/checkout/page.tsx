'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE } from '../../lib/api';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    const amountParam = searchParams.get('amount');
    const clientSecretParam = searchParams.get('clientSecret');
    
    if (amountParam) setAmount(parseFloat(amountParam));
    if (clientSecretParam) setClientSecret(clientSecretParam);
  }, [searchParams]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm payment
      const response = await fetch(`${API_BASE}/payments/confirm`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Payment failed');
      }
      
      const { order } = await response.json();
      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gradient">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
          </div>
          <div className="space-x-4">
            <a href="/products" className="btn-primary ripple">
              Continue Shopping
            </a>
            <a href="/" className="btn-secondary ripple">
              Back to Home
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Checkout</h1>
        <p className="text-lg text-gray-600">Complete your purchase</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Payment Summary */}
        <div className="card p-8 space-y-6">
          <h2 className="text-2xl font-bold">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">{amount}€</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span>Total</span>
                <span className="text-gradient">{amount}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="card p-8 space-y-6">
          <h2 className="text-2xl font-bold">Payment Information</h2>
          
          {/* Mock Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Demo Payment</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This is a demo checkout. Click "Complete Payment" to simulate a successful transaction.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary ripple w-full text-lg py-4 hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </div>
            ) : (
              <>
                Complete Payment
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

