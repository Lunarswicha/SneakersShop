'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function AdminProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  async function load(){ const d = await api('/products'); setItems(d.items); }
  useEffect(() => { load(); }, []);

  async function create() {
    await api('/products', { method: 'POST', body: JSON.stringify({ name }) });
    setName('');
    await load();
  }

  return (
    <section className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Admin  Products</h1>
        <p className="text-lg text-gray-600">Manage your product catalog</p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/admin/inventory" 
            className="btn-primary ripple"
          >
             Gestion des Stocks
          </Link>
        </div>
      </div>

      {/* Create Product Form */}
      <div className="card p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>
        <div className="flex gap-4">
          <input 
            className="input flex-1" 
            placeholder="Product name" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
          />
          <button 
            onClick={create} 
            className="btn-primary ripple px-8"
            disabled={!name.trim()}
          >
            Create Product
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Products ({items.length})</h2>
        {items.length === 0 ? (
          <div className="text-center py-16 card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">Create your first product to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((p, index) => (
              <div 
                key={p.id} 
                className="card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      <p className="text-sm text-gray-500">Product ID: {p.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Created</span>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
