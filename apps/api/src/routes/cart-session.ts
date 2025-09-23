import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const router = Router();

// Simple in-memory cart storage (in production, use Redis or database)
const sessionCarts = new Map<string, any[]>();

// Generate a simple session ID
function getSessionId(req: any): string {
  // Try to get session ID from cookie first
  let sessionId = req.cookies?.sessionId as string;
  
  if (!sessionId) {
    // Try to get from header
    sessionId = req.headers['x-session-id'] as string;
  }
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  return sessionId;
}

router.get('/', async (req, res) => {
  const sessionId = getSessionId(req);
  const cart = sessionCarts.get(sessionId) || [];
  
  // Get product details for cart items
  const cartWithDetails = await Promise.all(
    cart.map(async (item: any) => {
      try {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { 
            images: { where: { isPrimary: true }, take: 1 },
            brand: true 
          }
        });
        
        if (product) {
          return {
            ...item,
            product: {
              id: product.id,
              name: product.name,
              basePrice: product.basePrice,
              images: product.images,
              brand: product.brand
            }
          };
        } else {
          console.error(`Product with ID ${item.productId} not found`);
          return {
            ...item,
            product: { 
              id: item.productId,
              name: 'Product Not Found', 
              basePrice: 0,
              images: [],
              brand: null
            }
          };
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        return {
          ...item,
          product: { 
            id: item.productId,
            name: 'Error Loading Product', 
            basePrice: 0,
            images: [],
            brand: null
          }
        };
      }
    })
  );
  
  // Set session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ items: cartWithDetails, sessionId });
});

router.post('/', async (req, res) => {
  const sessionId = getSessionId(req);
  
  const schema = z.object({ 
    productId: z.union([z.number(), z.string().transform(Number)]), 
    quantity: z.union([z.number(), z.string().transform(Number)]).refine(val => val >= 1 && val <= 10, "Quantity must be between 1 and 10"),
    size: z.string().optional(),
    color: z.string().optional()
  });
  
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  
  const { productId, quantity, size, color } = parsed.data;
  
  // Get current cart
  const cart = sessionCarts.get(sessionId) || [];
  
  // Check if item already exists
  const existingIndex = cart.findIndex(
    (item: any) => item.productId === productId && item.size === size && item.color === color
  );
  
  if (existingIndex >= 0) {
    // Update quantity
    cart[existingIndex].quantity += quantity;
  } else {
    // Add new item
    cart.push({
      productId,
      quantity,
      size: size || 'One Size',
      color: color || 'Default',
      id: Date.now() + Math.random() // Simple ID
    });
  }
  
  sessionCarts.set(sessionId, cart);
  
  // Set session cookie
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({ 
    success: true, 
    message: 'Added to cart',
    sessionId,
    cartCount: cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
  });
});

router.delete('/:itemId', async (req, res) => {
  const sessionId = getSessionId(req);
  const itemId = req.params.itemId;
  
  const cart = sessionCarts.get(sessionId) || [];
  const filteredCart = cart.filter((item: any) => item.id.toString() !== itemId);
  sessionCarts.set(sessionId, filteredCart);
  
  res.json({ success: true, message: 'Item removed from cart' });
});

router.put('/:itemId', async (req, res) => {
  const sessionId = getSessionId(req);
  const itemId = req.params.itemId;
  const { quantity } = req.body;
  
  const cart = sessionCarts.get(sessionId) || [];
  const itemIndex = cart.findIndex((item: any) => item.id.toString() === itemId);
  
  if (itemIndex >= 0) {
    cart[itemIndex].quantity = Math.max(1, Math.min(10, quantity));
    sessionCarts.set(sessionId, cart);
  }
  
  res.json({ success: true, message: 'Cart updated' });
});

export default router;
