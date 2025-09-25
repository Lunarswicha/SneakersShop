import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive sneaker image database with real product URLs
const SNEAKER_IMAGES = {
  // Nike Air Force 1
  "Nike Air Force 1": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Nike Air Force 1 '07": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  
  // Nike Air Max Series
  "Nike Air Max 1": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Max 90": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Max 95": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Max 97": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Max 270": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Max 720": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Nike Running
  "Nike React Infinity Run": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Pegasus 40": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Free RN": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Zoom Vomero 5": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike ZoomX Vaporfly 3": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Nike Lifestyle
  "Nike Dunk Low": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Dunk High": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Blazer Mid '77": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Cortez": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Internationalist": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike Air Huarache": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Nike ACG Mountain Fly Low": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Jordan
  "Jordan 1 Retro High OG": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 1 Mid": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 4 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 3 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 11 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 6 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 5 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 13 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  "Jordan 12 Retro": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  
  // Adidas
  "adidas Stan Smith": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Superstar": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Samba OG": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Gazelle": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Campus 00s": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Forum Low": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Forum High": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas NMD_R1": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Ultraboost 1.0": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Ultraboost 21": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas ZX 8000": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Yeezy Boost 350 V2": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  "adidas Yeezy 700 V1": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  
  // New Balance
  "New Balance 990v5": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 990v6": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 993": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 992": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 2002R": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 1906R": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 530": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 550": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance 574": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "New Balance Fresh Foam 1080v13": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Converse
  "Converse Chuck Taylor All Star High": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Converse Chuck Taylor All Star Low": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Converse Chuck 70 High": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  
  // Vans
  "Vans Old Skool": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Vans Authentic": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Vans Sk8-Hi": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  "Vans Slip-On": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  
  // ASICS
  "ASICS GEL-Kayano 30": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS GEL-Nimbus 26": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS GEL-Cumulus 26": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS GEL-1130": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS GT-2000 12": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS GEL-Lyte III": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "ASICS Novablast 4": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Puma
  "Puma Suede Classic": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Puma Clyde": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Puma RS-X": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Puma Future Rider": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Puma Palermo": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Puma Speedcat": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Reebok
  "Reebok Club C 85": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Reebok Classic Leather": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Reebok Workout Plus": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Reebok Nano X4": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Reebok Question Mid": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Reebok Pump Omni Zone II": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  
  // Other brands
  "Saucony Jazz Original": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Saucony Shadow 6000": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Saucony Endorphin Speed 4": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Hoka Clifton 9": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Hoka Bondi 8": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Hoka Arahi 7": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "On Cloud 5": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "On Cloudmonster": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "On Cloudswift 3": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Salomon XT-6": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Salomon ACS Pro": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Salomon Speedcross 6": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Brooks Ghost 16": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Brooks Adrenaline GTS 23": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Brooks Glycerin 21": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Mizuno Wave Rider 28": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Mizuno Wave Inspire 20": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Karhu Fusion 2.0": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Diadora N9000": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Veja V-10": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Veja Campo": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Common Projects Achilles Low": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  "Autry Medalist Low": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
};

function findBestImageMatch(productName: string): string {
  // Try exact match first
  if (SNEAKER_IMAGES[productName as keyof typeof SNEAKER_IMAGES]) {
    return SNEAKER_IMAGES[productName as keyof typeof SNEAKER_IMAGES];
  }
  
  // Try partial matches
  for (const [key, imageUrl] of Object.entries(SNEAKER_IMAGES)) {
    if (productName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(productName.toLowerCase())) {
      return imageUrl;
    }
  }
  
  // Try word-by-word matching
  const productWords = productName.toLowerCase().split(/\s+/);
  for (const [key, imageUrl] of Object.entries(SNEAKER_IMAGES)) {
    const keyWords = key.toLowerCase().split(/\s+/);
    const matchingWords = productWords.filter(word => 
      keyWords.some(keyWord => keyWord.includes(word) || word.includes(keyWord))
    );
    
    if (matchingWords.length >= Math.min(2, productWords.length - 1)) {
      return imageUrl;
    }
  }
  
  // Default fallback
  return "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop";
}

async function updateAllProductImages() {
  console.log(' Starting comprehensive image update...');
  
  const products = await prisma.product.findMany({
    include: {
      images: true
    }
  });
  
  console.log(` Found ${products.length} products to update`);
  
  let updated = 0;
  let errors = 0;
  
  for (const product of products) {
    try {
      const imageUrl = findBestImageMatch(product.name);
      
      if (product.images.length > 0) {
        await prisma.productImage.update({
          where: { id: product.images[0].id },
          data: {
            imageUrl: imageUrl,
            altText: product.name
          }
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: imageUrl,
            altText: product.name,
            isPrimary: true,
            displayOrder: 0
          }
        });
      }
      
      console.log(` Updated: ${product.name}`);
      updated++;
      
    } catch (error) {
      console.error(` Error updating ${product.name}:`, error);
      errors++;
    }
  }
  
  console.log(`\n Comprehensive update complete!`);
  console.log(` Updated: ${updated} products`);
  console.log(` Errors: ${errors} products`);
}

async function main() {
  try {
    await updateAllProductImages();
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

