import ProductCard from '../../components/ProductCard';
import { API_BASE } from '../../lib/api';

export default async function ProductsPage({ searchParams }: any) {
  const q = searchParams?.q || '';
  const page = searchParams?.page || '1';
  const res = await fetch(`${API_BASE}/products?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}&pageSize=100`, { cache: 'no-store' });
  const data = await res.json();
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient">All Sneakers</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our curated collection of premium sneakers from top brands. 
          Find your perfect pair for every occasion.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto animate-slide-in-right">
        <form className="relative">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              name="q" 
              defaultValue={q} 
              placeholder="Search sneakers, brands..." 
              className="input-search pl-12 pr-4 py-4 text-center" 
            />
          </div>
          {q && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              Showing results for "{q}"
            </div>
          )}
        </form>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((p: any, index: number) => (
          <div 
            key={p.id} 
            className="animate-fade-in-up" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.items.length === 0 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sneakers found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search terms or browse all products.</p>
          <a href="/products" className="btn-primary ripple">
            Browse All Products
          </a>
        </div>
      )}
    </section>
  );
}
