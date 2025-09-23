'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProductDetail({ params }: any) {
  const { user, loading } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState<string | ''>('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    // Fetch product data
    fetch(`${API_BASE}/products/${params.id}`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(setProduct)
      .catch(() => setProduct({ error: true }));
  }, [params.id]);

  async function addToCart() {
    try {
      // Si l'utilisateur est connecté et que le produit a des variantes, utiliser l'API d'authentification
      if (user && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: any) => 
          v.size === Number(selectedSize) && v.color === selectedColor
        );
        
        if (!variant) {
          alert('Selected size and color combination not available');
          return;
        }

        const response = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productVariantId: variant.id, quantity: Number(qty) })
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`Added to cart! (${result.length || 0} items total)`);
        } else {
          const errorText = await response.text();
          alert(`Failed to add to cart: ${errorText}`);
        }
      } else {
        // Utiliser l'API de session pour les utilisateurs non connectés ou les produits sans variantes
        // Récupérer l'ID de session depuis localStorage
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('sessionId', sessionId);
        }
        
        const response = await fetch(`${API_BASE}/cart-session`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Session-ID': sessionId
          },
          credentials: 'include',
          body: JSON.stringify({ 
            productId: Number(product.id), 
            quantity: Number(qty),
            size: selectedSize ? String(selectedSize) : 'One Size',
            color: selectedColor || 'Default'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Mettre à jour l'ID de session si nécessaire
          if (result.sessionId && result.sessionId !== sessionId) {
            localStorage.setItem('sessionId', result.sessionId);
          }
          alert(`Added to cart! (${result.cartCount} items total)`);
        } else {
          const errorText = await response.text();
          alert(`Failed to add to cart: ${errorText}`);
        }
      }
    } catch (e: any) {
      alert(`Failed to add to cart: ${e.message}`);
    }
  }

  if (!product) return <div className="p-8">Loading...</div>;
  if ((product as any).error) return <div className="p-8 text-red-600">Failed to load product. Please go back and try again.</div>;
  
  // Default sizes for sneakers
  const defaultSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
  const defaultColors = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue', 'Green'];
  
  // Use product variants if available, otherwise use defaults
  const hasVariants = product.variants && product.variants.length > 0;
  const uniqueSizes = hasVariants ? 
    Array.from(new Set(product.variants.map((v: any) => Number(v.size || 0)).filter((s: number) => s > 0))).sort((a, b) => a - b) :
    defaultSizes;
  
  const availableColors = hasVariants ?
    Array.from(new Set(product.variants.map((v: any) => v.color).filter((c: string) => c))) :
    defaultColors;

  return (
    <section className="grid md:grid-cols-2 gap-12 animate-fade-in-up p-8">
      {/* Product Image */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden card hover-glow group">
          {product.images?.[0] ? (
            <img 
              src={product.images[0].imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gradient">{product.name}</h1>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            {product.description || `Premium ${product.brand?.name || 'sneaker'} designed for comfort and style.`}
          </p>
          
          <div className="text-3xl font-bold text-gradient">
            {Number(product.basePrice ?? product.variants?.[0]?.price ?? 0).toFixed(0)}€
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold">Size</label>
          <select 
            className="input w-full" 
            value={selectedSize} 
            onChange={e => setSelectedSize(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Select size</option>
            {uniqueSizes.map((s:number) => (
              <option key={s} value={s}>Size {s}</option>
            ))}
          </select>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold">Color</label>
          <select 
            className="input w-full" 
            value={selectedColor} 
            onChange={e => setSelectedColor(e.target.value)}
          >
            <option value="">Select color</option>
            {availableColors.map((c:string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Quantity Selection */}
        <div className="space-y-4">
          <label className="block text-lg font-semibold">Quantity</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input 
              type="number" 
              min={1} 
              max={10} 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="input w-20 text-center" 
            />
            <button 
              onClick={() => setQty(Math.min(10, qty + 1))}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={addToCart} 
          className="btn-primary ripple w-full text-lg py-4 hover-glow"
          disabled={!selectedSize || !selectedColor}
        >
          {!selectedSize || !selectedColor ? 'Select size and color' : 'Add to cart'}
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </button>
      </div>
    </section>
  );
}
