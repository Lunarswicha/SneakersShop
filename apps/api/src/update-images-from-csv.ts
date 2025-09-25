import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

interface ProductRow {
  Name: string;
  Description: string;
  Photos: string;
  ImageURL: string;
  License: string;
  Source: string;
}

function parseCsv(csv: string): Array<ProductRow> {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((header, i) => {
      row[header.trim()] = values[i]?.trim() || '';
    });
    return row as ProductRow;
  });
}

async function main() {
  console.log(' Updating product images from CSV...');
  
  const csvPath = path.resolve(__dirname, '../../../tools/scraper/output/sneakers_improved_images.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csvContent);
  
  console.log(` Found ${rows.length} products to update`);
  
  let updated = 0;
  let errors = 0;
  
  for (const row of rows) {
    try {
      const name = row.Name?.trim();
      const imageUrl = row.ImageURL?.trim();
      
      if (!name || !imageUrl) {
        console.log(`  Skipping ${name} - missing data`);
        continue;
      }
      
      // Find the product by name
      const product = await prisma.product.findFirst({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        include: {
          images: true
        }
      });
      
      if (!product) {
        console.log(` Product not found: ${name}`);
        errors++;
        continue;
      }
      
      // Update the primary image
      if (product.images.length > 0) {
        await prisma.productImage.update({
          where: { id: product.images[0].id },
          data: {
            imageUrl: imageUrl,
            altText: name
          }
        });
      } else {
        // Create new image if none exists
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: imageUrl,
            altText: name,
            isPrimary: true,
            displayOrder: 0
          }
        });
      }
      
      console.log(` Updated: ${name}`);
      updated++;
      
    } catch (error) {
      console.error(` Error updating ${row.Name}:`, error);
      errors++;
    }
  }
  
  console.log(`\n Update complete!`);
  console.log(` Updated: ${updated} products`);
  console.log(` Errors: ${errors} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
