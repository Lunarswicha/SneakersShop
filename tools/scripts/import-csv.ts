import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCsv(csv: string): Array<Record<string,string>> {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split('\t').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split('\t').map(c => c.trim());
    const row: Record<string,string> = {};
    headers.forEach((h, i) => row[h] = cols[i] || '');
    return row;
  });
}

function extractBrandFromName(name: string): string {
  const brandPatterns = [
    'Nike', 'Jordan', 'Converse', 'Vans', 'adidas', 'New Balance', 
    'ASICS', 'Puma', 'Reebok', 'Saucony', 'Hoka', 'On', 'Salomon', 
    'Brooks', 'Mizuno', 'Karhu', 'Diadora', 'Veja', 'Common Projects', 'Autry'
  ];
  
  for (const brand of brandPatterns) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return 'Unknown';
}

function generateImageUrl(query: string): string {
  // Convert Google search URL to a more direct image search
  const searchQuery = query.replace('https://www.google.com/search?tbm=isch&q=', '');
  const decodedQuery = decodeURIComponent(searchQuery);
  // Use Unsplash as a fallback for now - in production you'd want to use actual image APIs
  return `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
}

async function run() {
  const p = path.resolve(__dirname, '../scraper/output/products.csv');
  const content = readFileSync(p, 'utf-8');
  const rows = parseCsv(content);
  
  console.log(`Found ${rows.length} products to import`);
  
  // Clean existing products to avoid conflicts
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.shoppingCart.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  
  const category = await prisma.category.upsert({ 
    where: { slug: 'sneakers' }, 
    update: { name: 'Sneakers' }, 
    create: { name: 'Sneakers', slug: 'sneakers' } 
  });

  const colorways = ['White/Black', 'Black/White', 'White', 'Black', 'Red', 'Blue', 'Green', 'Grey'];
  const sizes = [40, 41, 42, 43, 44, 45, 46];
  
  let imported = 0;
  
  for (const row of rows) {
    const name = row.Name?.trim();
    const description = row.Description?.trim();
    const photosUrl = row.Photos?.trim();
    
    if (!name) continue;
    
    const brandName = extractBrandFromName(name);
    const basePrice = 80 + Math.floor(Math.random() * 200); // Random price between 80-280
    
    // Create or get brand
    const brand = await prisma.brand.upsert({ 
      where: { name: brandName }, 
      update: {}, 
      create: { name: brandName } 
    });

    // Generate image URL
    const imageUrl = photosUrl ? generateImageUrl(photosUrl) : 
      `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        brandId: brand.id,
        categoryId: category.id,
        basePrice,
        description: description || `${name} - A premium sneaker from ${brandName}`,
        sku: `SKU-${1000 + imported}`,
        scrapedFrom: 'CSV Import',
        images: {
          create: [
            { 
              imageUrl, 
              isPrimary: true, 
              altText: name,
              displayOrder: 0
            }
          ]
        }
      }
    });

    // Create product variants with different sizes and colors
    const variants = [];
    for (const color of colorways.slice(0, 4)) { // Limit to 4 colors per product
      for (const size of sizes) {
        variants.push({
          productId: product.id,
          size,
          color,
          stockQuantity: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
          price: basePrice + (Math.floor(Math.random() * 50)) // Add some price variation
        });
      }
    }
    
    await prisma.productVariant.createMany({
      data: variants
    });
    
    imported++;
    if (imported % 10 === 0) {
      console.log(`Imported ${imported}/${rows.length} products...`);
    }
  }
  
  console.log(`Import complete: ${imported} products imported with variants`);
  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
