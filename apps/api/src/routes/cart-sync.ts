import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Synchroniser le panier de session vers le panier d'authentification
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { sessionCartItems } = req.body;

    if (!sessionCartItems || !Array.isArray(sessionCartItems)) {
      return res.status(400).json({ error: 'Invalid session cart items' });
    }

    // Vider le panier d'authentification existant
    await prisma.shoppingCart.deleteMany({
      where: { userId: user.id }
    });

    // Ajouter les articles du panier de session au panier d'authentification
    const cartItems = [];
    
    for (const sessionItem of sessionCartItems) {
      // Pour les articles de session, on doit cr√er des variantes virtuelles
      // ou utiliser les variantes existantes du produit
      const product = await prisma.product.findUnique({
        where: { id: sessionItem.productId },
        include: { variants: true }
      });

      if (!product) continue;

      let variantId;
      
      if (product.variants.length > 0) {
        // Utiliser la premi√re variante disponible
        variantId = product.variants[0].id;
      } else {
        // Cr√er une variante virtuelle pour les produits sans variantes
        const virtualVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: sessionItem.size ? parseFloat(sessionItem.size) : null,
            color: sessionItem.color || 'Default',
            price: parseFloat(product.basePrice || 0),
            stockQuantity: 100, // Stock virtuel
            sku: `VIRTUAL-${product.id}-${Date.now()}`
          }
        });
        variantId = virtualVariant.id;
      }

      // Ajouter au panier d'authentification
      const cartItem = await prisma.shoppingCart.create({
        data: {
          userId: user.id,
          productVariantId: variantId,
          quantity: sessionItem.quantity
        }
      });

      cartItems.push(cartItem);
    }

    // R√cup√rer le panier complet avec les d√tails
    const fullCart = await prisma.shoppingCart.findMany({
      where: { userId: user.id },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Cart synchronized successfully',
      cart: fullCart,
      syncedItems: cartItems.length
    });

  } catch (error) {
    console.error('Error synchronizing cart:', error);
    res.status(500).json({ error: 'Failed to synchronize cart' });
  }
});

export default router;
