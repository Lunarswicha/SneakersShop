import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }: any) {
  const img = product.images?.[0]?.imageUrl;
  const price = product.basePrice ?? product.variants?.[0]?.price ?? 0;
  return (
    <div className="card-interactive group flex flex-col animate-fade-in-up">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Link
              href={`/products/${product.id}`}
              className="btn-primary ripple text-sm px-4 py-2"
            >
              Quick View
            </Link>
          </div>
        </div>
        
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
          {Number(price).toFixed(0)}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-gray-800 transition-colors">
            {product.name}
          </h3>
          <div className="text-sm text-gray-500 font-medium">{product.brand?.name}</div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-gradient">
            {Number(price).toFixed(0)}
          </div>
          <Link
            href={`/products/${product.id}`}
            className="btn-secondary ripple text-sm px-4 py-2 flex items-center gap-2"
          >
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
