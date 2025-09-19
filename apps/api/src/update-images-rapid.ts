import 'dotenv/config';
import { prisma } from './lib/prisma.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
// Default to The Sneaker Database on RapidAPI
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'thesneakerdatabase.p.rapidapi.com';

async function fetchImageForQuery(query: string): Promise<string | null> {
  // Primary endpoint (The Sneaker Database)
  const candidates = [
    `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}&limit=5`,
    `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query + ' sneaker')}&limit=5`,
  ];
  try {
    for (const url of candidates) {
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        },
      } as any);
      if (!res.ok) continue;
      const data = await res.json();
      const items: any[] = Array.isArray(data) ? data : (data?.results || data?.data || data?.Products || []);
      for (const it of items) {
        const img = it?.image || it?.imageUrl || it?.thumbnail || it?.media?.imageUrl || it?.media?.smallImageUrl || it?.media?.thumbUrl || it?.links?.image;
        if (typeof img === 'string' && img.startsWith('http')) return img;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  if (!RAPIDAPI_KEY) {
    console.error('Missing RAPIDAPI_KEY in environment');
    process.exit(1);
  }

  const products = await prisma.product.findMany({ include: { brand: true, images: true } });
  let updated = 0;
  for (const p of products) {
    const brandName = p.brand?.name || '';
    const query = p.name || `${brandName}`;
    const img = await fetchImageForQuery(query);
    if (!img) continue;
    if (p.images.length > 0) {
      await prisma.productImage.update({ where: { id: p.images[0].id }, data: { imageUrl: img, isPrimary: true, altText: p.name } });
    } else {
      await prisma.productImage.create({ data: { productId: p.id, imageUrl: img, isPrimary: true, altText: p.name } });
    }
    updated++;
    // Small delay to be polite with API
    await new Promise(r => setTimeout(r, 250));
  }
  console.log(`Updated ${updated} product images via RapidAPI.`);
}

main().finally(() => prisma.$disconnect());


