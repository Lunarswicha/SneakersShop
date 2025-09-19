import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Deprecated: moved to payments flow
// router.post('/checkout' ...)

router.get('/', requireAuth, async (req,res) => {
  const user = (req as any).user;
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true } });
  res.json(orders);
});

export default router;
