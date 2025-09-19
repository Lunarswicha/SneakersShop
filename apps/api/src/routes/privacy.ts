import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/export', requireAuth, async (req,res) => {
  const id = (req as any).user.id;
  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } }),
    prisma.order.findMany({ where: { userId: id }, include: { items: true } }),
  ]);
  res.setHeader('Content-Disposition', 'attachment; filename="my-data.json"');
  res.json({ user, orders });
});

router.delete('/erase', requireAuth, async (req,res) => {
  const id = (req as any).user.id;
  await prisma.orderItem.deleteMany({ where: { order: { userId: id } } });
  await prisma.order.deleteMany({ where: { userId: id } });
  await prisma.shoppingCart.deleteMany({ where: { userId: id } });
  await prisma.userSession.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
