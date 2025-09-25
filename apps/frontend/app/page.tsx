import Link from 'next/link';

export default async function Home() {
  return (
    <section className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-white p-12 md:p-20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-glow animate-fade-in-up">
            Fresh kicks for every move
          </h1>
          <p className="text-xl text-white/90 leading-relaxed animate-slide-in-right">
            Explore 100+ sneaker models across top brands with multiple colorways and sizes. 
            Try the cart and a simulated checkout experience.
          </p>
          <div className="pt-4 animate-fade-in-up">
            <Link href="/products" className="btn-primary ripple text-lg px-8 py-4 hover-glow">
              Browse products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/5 blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute right-1/4 top-1/4 w-32 h-32 rounded-full bg-white/15 blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Story Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-gradient">Our story</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Born from a late-night debate over the best everyday sneaker, SneakerShop is a tiny, 
            independent project built by runners, hoopers, and collectors. We obsess over fit, 
            feel, and heritage. This demo showcases a modern stack for product discovery, carts, 
            and checkout  with a catalog inspired by real models from the brands we love.
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
              B
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
              S
            </div>
          </div>
        </div>
        <div className="relative group animate-slide-in-right">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden card hover-glow">
            <img 
              src="https://images.unsplash.com/photo-1557804483-ef3ae78eca57?q=80&w=1600&auto=format&fit=crop" 
              alt="Our team" 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-60 animate-pulse" />
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mt-20">
        <div className="card p-8 text-center hover-lift group">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
            D
          </div>
          <h3 className="text-xl font-semibold mb-3">Discover</h3>
          <p className="text-gray-600">Find your perfect sneakers with our advanced search and filtering system.</p>
        </div>
        <div className="card p-8 text-center hover-lift group">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-2xl">
            C
          </div>
          <h3 className="text-xl font-semibold mb-3">Collect</h3>
          <p className="text-gray-600">Build your collection with our curated selection of premium sneakers.</p>
        </div>
        <div className="card p-8 text-center hover-lift group">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl">
            R
          </div>
          <h3 className="text-xl font-semibold mb-3">Run</h3>
          <p className="text-gray-600">Experience comfort and performance with every step you take.</p>
        </div>
      </div>
    </section>
  );
}
