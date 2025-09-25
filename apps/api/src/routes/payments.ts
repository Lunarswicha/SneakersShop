import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/create', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const cart = await prisma.shoppingCart.findMany({
    where: { userId: user.id },
    include: { variant: true }
  });
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const amount = cart.reduce((sum, i) => sum + Number(i.variant.price || 0) * i.quantity, 0);
  const clientSecret = 'fake_cs_' + Date.now();
  res.json({ clientSecret, amount });
});

// Route pour les utilisateurs non connectÃs (panier de session)
router.post('/create-session', async (req, res) => {
  try {
    // Simuler la rÃcupÃration du panier de session
    // Dans un vrai systÃme, vous rÃcupÃreriez le panier depuis la session
    const sessionCart = req.body.cartItems || [];
    
    if (sessionCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const amount = sessionCart.reduce((sum: number, item: any) => {
      return sum + Number(item.price || 0) * item.quantity;
    }, 0);
    
    const clientSecret = 'fake_cs_session_' + Date.now();
    res.json({ clientSecret, amount });
  } catch (error) {
    console.error('Error creating session payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.post('/confirm', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const cart = await prisma.shoppingCart.findMany({
    where: { userId: user.id },
    include: { variant: true }
  });
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const total = cart.reduce((sum, i) => sum + Number(i.variant.price || 0) * i.quantity, 0);
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber: `ORD-${Date.now()}`,
      totalAmount: total,
      status: 'confirmed',
      paymentStatus: 'paid',
      items: { create: cart.map(i => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        unitPrice: i.variant.price || 0,
        totalPrice: (i.variant.price || 0) * i.quantity
      })) }
    },
    include: { items: true }
  });

  for (const i of cart) {
    await prisma.productVariant.update({
      where: { id: i.productVariantId },
      data: { stockQuantity: { decrement: i.quantity } }
    });
  }
  await prisma.shoppingCart.deleteMany({ where: { userId: user.id } });
  res.json({ ok: true, order });
});

export default router;









