import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for invalid image URLs...');
  
  // Find all products with invalid image URLs
  const products = await prisma.product.findMany({
    include: {
      images: true
    }
  });
  
  let fixed = 0;
  let errors = 0;
  
  for (const product of products) {
    for (const image of product.images) {
      const imageUrl = image.imageUrl;
      
      // Check if the URL is invalid (contains Google search or other invalid patterns)
      if (!imageUrl || 
          imageUrl.includes('google.com/search') || 
          imageUrl.includes('and affordable') ||
          !imageUrl.startsWith('http')) {
        
        console.log(`🔧 Fixing invalid URL for ${product.name}: ${imageUrl}`);
        
        // Assign a proper fallback image based on brand
        let fallbackUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
        
        if (product.name.toLowerCase().includes('nike')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop';
        } else if (product.name.toLowerCase().includes('adidas')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop';
        } else if (product.name.toLowerCase().includes('jordan')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop';
        } else if (product.name.toLowerCase().includes('converse')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
        } else if (product.name.toLowerCase().includes('vans')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
        }
        
        try {
          await prisma.productImage.update({
            where: { id: image.id },
            data: {
              imageUrl: fallbackUrl,
              altText: product.name
            }
          });
          
          console.log(`✅ Fixed: ${product.name} -> ${fallbackUrl}`);
          fixed++;
        } catch (error) {
          console.error(`❌ Error fixing ${product.name}:`, error);
          errors++;
        }
      }
    }
  }
  
  console.log(`\n🎉 Fix complete!`);
  console.log(`✅ Fixed: ${fixed} images`);
  console.log(`❌ Errors: ${errors} images`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

