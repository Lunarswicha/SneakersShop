import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RAPIDAPI_KEY = "66489bea50mshf22f7fbd7bb44a6p1271a4jsn01d298c98ea9";
const RAPIDAPI_HOST = "kickscrew-sneakers-data.p.rapidapi.com";

interface KicksCrewProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  colorway: string;
  sku: string;
}

interface KicksCrewResponse {
  data: KicksCrewProduct[];
  total: number;
  page: number;
  limit: number;
}

async function fetchKicksCrewProducts(brand: string, page: number = 1): Promise<KicksCrewProduct[]> {
  const url = `https://${RAPIDAPI_HOST}/product/bycollection/v2/filters?collection=${brand}&page=${page}&limit=50`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: KicksCrewResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${brand} products:`, error);
    return [];
  }
}

function findBestMatch(productName: string, kicksCrewProducts: KicksCrewProduct[]): KicksCrewProduct | null {
  const productNameLower = productName.toLowerCase();
  
  // Try exact match first
  for (const product of kicksCrewProducts) {
    if (product.name.toLowerCase() === productNameLower) {
      return product;
    }
  }
  
  // Try partial match
  for (const product of kicksCrewProducts) {
    const productNameWords = productNameLower.split(/\s+/);
    const kicksCrewWords = product.name.toLowerCase().split(/\s+/);
    
    // Check if most words match
    const matchingWords = productNameWords.filter(word => 
      kicksCrewWords.some(kw => kw.includes(word) || word.includes(kw))
    );
    
    if (matchingWords.length >= Math.min(2, productNameWords.length - 1)) {
      return product;
    }
  }
  
  // Try brand + model match
  for (const product of kicksCrewProducts) {
    if (product.brand && product.model) {
      const brandModel = `${product.brand} ${product.model}`.toLowerCase();
      if (productNameLower.includes(brandModel) || brandModel.includes(productNameLower)) {
        return product;
      }
    }
  }
  
  return null;
}

async function updateProductImages() {
  console.log('🚀 Starting KicksCrew image update...');
  
  // Get all products from database
  const products = await prisma.product.findMany({
    include: {
      images: true,
      brand: true
    }
  });
  
  console.log(`📊 Found ${products.length} products to update`);
  
  // Group products by brand
  const productsByBrand = new Map<string, any[]>();
  for (const product of products) {
    const brandName = product.brand.name.toLowerCase();
    if (!productsByBrand.has(brandName)) {
      productsByBrand.set(brandName, []);
    }
    productsByBrand.get(brandName)!.push(product);
  }
  
  let totalUpdated = 0;
  let totalErrors = 0;
  
  // Process each brand
  for (const [brandName, brandProducts] of productsByBrand) {
    console.log(`\n🔍 Processing ${brandName} (${brandProducts.length} products)...`);
    
    // Fetch KicksCrew products for this brand
    const kicksCrewProducts = await fetchKicksCrewProducts(brandName);
    
    if (kicksCrewProducts.length === 0) {
      console.log(`⚠️  No KicksCrew products found for ${brandName}`);
      continue;
    }
    
    console.log(`📦 Found ${kicksCrewProducts.length} KicksCrew products for ${brandName}`);
    
    // Match and update products
    for (const product of brandProducts) {
      try {
        const bestMatch = findBestMatch(product.name, kicksCrewProducts);
        
        if (bestMatch && bestMatch.image) {
          // Update the primary image
          if (product.images.length > 0) {
            await prisma.productImage.update({
              where: { id: product.images[0].id },
              data: {
                imageUrl: bestMatch.image,
                altText: product.name
              }
            });
          } else {
            await prisma.productImage.create({
              data: {
                productId: product.id,
                imageUrl: bestMatch.image,
                altText: product.name,
                isPrimary: true,
                displayOrder: 0
              }
            });
          }
          
          console.log(`✅ Updated: ${product.name} -> ${bestMatch.name}`);
          totalUpdated++;
        } else {
          console.log(`❌ No match found for: ${product.name}`);
          totalErrors++;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error);
        totalErrors++;
      }
    }
  }
  
  console.log(`\n🎉 KicksCrew update complete!`);
  console.log(`✅ Updated: ${totalUpdated} products`);
  console.log(`❌ Errors: ${totalErrors} products`);
}

async function main() {
  try {
    await updateProductImages();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

