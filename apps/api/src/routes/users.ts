import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/me', requireAuth, async (req,res) => {
  const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  res.json({ id: user?.id, email: user?.email, role: user?.role });
});

router.get('/', requireAuth, requireRole('admin','moderator'), async (_req,res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

router.post('/:id/role', requireAuth, requireRole('admin'), async (req,res) => {
  const schema = z.object({ role: z.enum(['customer','moderator','admin']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid role' });
  const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { role: parsed.data.role } });
  res.json(user);
});

export default router;
