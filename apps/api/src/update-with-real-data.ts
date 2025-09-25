import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

interface RealProduct {
  name: string;
  brand: string;
  model: string;
  image_url: string;
  price: number;
  retail_price: number;
  colorway: string;
  sku: string;
  description: string;
  release_date: string;
  category: string;
  style_code: string;
  availability: string;
  sizes: string;
  colors: string;
  gender: string;
  main_color: string;
  series: string;
  occasion: string;
  inventory_count: number;
}

async function updateDatabaseWithRealData() {
  console.log(' Updating database with real KicksCrew data...');
  
  // Read the CSV file
  const csvPath = path.resolve(__dirname, '../../../tools/real_sneaker_products.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  console.log(` Found ${lines.length} real products to process`);
  
  let updated = 0;
  let created = 0;
  let errors = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const [
        name, brand, model, image_url, price, retail_price, colorway, sku,
        description, release_date, category, style_code, availability, rating,
        reviews_count, sizes, colors, gender, age_group, discount,
        is_featured, is_new, is_sale, url, main_color, series, occasion, inventory_count
      ] = line.split(',');
      
      const realProduct: RealProduct = {
        name: name?.replace(/"/g, '') || '',
        brand: brand?.replace(/"/g, '') || '',
        model: model?.replace(/"/g, '') || '',
        image_url: image_url?.replace(/"/g, '') || '',
        price: parseInt(price) || 0,
        retail_price: parseInt(retail_price) || 0,
        colorway: colorway?.replace(/"/g, '') || '',
        sku: sku?.replace(/"/g, '') || '',
        description: description?.replace(/"/g, '') || '',
        release_date: release_date?.replace(/"/g, '') || '',
        category: category?.replace(/"/g, '') || '',
        style_code: style_code?.replace(/"/g, '') || '',
        availability: availability?.replace(/"/g, '') || '',
        sizes: sizes?.replace(/"/g, '') || '',
        colors: colors?.replace(/"/g, '') || '',
        gender: gender?.replace(/"/g, '') || '',
        main_color: main_color?.replace(/"/g, '') || '',
        series: series?.replace(/"/g, '') || '',
        occasion: occasion?.replace(/"/g, '') || '',
        inventory_count: parseInt(inventory_count) || 0
      };
      
      if (!realProduct.name || !realProduct.image_url) {
        console.warn(` Skipping product with missing data: ${realProduct.name}`);
        continue;
      }
      
      // Find or create brand
      let brandRecord = await prisma.brand.findFirst({
        where: { name: realProduct.brand }
      });
      
      if (!brandRecord) {
        brandRecord = await prisma.brand.create({
          data: { name: realProduct.brand }
        });
        console.log(` Created brand: ${realProduct.brand}`);
      }
      
      // Find existing product by name
      let product = await prisma.product.findFirst({
        where: { name: realProduct.name }
      });
      
      if (product) {
        // Update existing product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: realProduct.description,
            basePrice: realProduct.price,
            brandId: brandRecord.id
          }
        });
        
        // Update primary image
        const primaryImage = await prisma.productImage.findFirst({
          where: { productId: product.id, isPrimary: true }
        });
        
        if (primaryImage) {
          await prisma.productImage.update({
            where: { id: primaryImage.id },
            data: {
              imageUrl: realProduct.image_url,
              altText: realProduct.name
            }
          });
        } else {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: realProduct.image_url,
              altText: realProduct.name,
              isPrimary: true,
              displayOrder: 0
            }
          });
        }
        
        console.log(` Updated: ${realProduct.name}`);
        updated++;
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            name: realProduct.name,
            description: realProduct.description,
            basePrice: realProduct.price,
            brandId: brandRecord.id,
            images: {
              create: {
                imageUrl: realProduct.image_url,
                altText: realProduct.name,
                isPrimary: true,
                displayOrder: 0
              }
            }
          }
        });
        
        console.log(` Created: ${realProduct.name}`);
        created++;
      }
      
    } catch (error) {
      console.error(` Error processing product:`, error);
      errors++;
    }
  }
  
  console.log(`\n Database update complete!`);
  console.log(` Updated: ${updated} products`);
  console.log(` Created: ${created} products`);
  console.log(` Errors: ${errors} products`);
}

async function main() {
  try {
    await updateDatabaseWithRealData();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
