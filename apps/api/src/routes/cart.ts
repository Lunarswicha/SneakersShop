import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const items = await prisma.shoppingCart.findMany({
    where: { userId: user.id },
    include: { variant: { include: { product: true } } }
  });
  res.json(items);
});

router.post('/', requireAuth, async (req,res) => {
  const user = (req as any).user;
  const schema = z.object({ productVariantId: z.number(), quantity: z.number().min(1).max(10) });
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { productVariantId, quantity } = parsed.data;
  const item = await prisma.shoppingCart.upsert({
    where: { userId_productVariantId: { userId: user.id, productVariantId } },
    update: { quantity },
    create: { userId: user.id, productVariantId, quantity }
  });
  res.json(item);
});

router.delete('/:variantId', requireAuth, async (req,res) => {
  const user = (req as any).user;
  const productVariantId = Number(req.params.variantId);
  await prisma.shoppingCart.delete({
    where: { userId_productVariantId: { userId: user.id, productVariantId } }
  });
  res.json({ ok: true });
});

export default router;
