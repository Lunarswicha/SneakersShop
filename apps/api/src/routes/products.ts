import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req, res) => {
  const { q, brand, category, page = '1', pageSize = '12' } = req.query as Record<string,string>;
  const skip = (parseInt(page) - 1) * parseInt(pageSize);
  const where: any = { isActive: true };
  if (q) where.name = { contains: q, mode: 'insensitive' };
  if (brand) where.brand = { name: { equals: brand } };
  if (category) where.category = { slug: { equals: category } };
  const [items, total] = await Promise.all([
    prisma.product.findMany({ 
      where, 
      include: { images: true, variants: true, brand: true }, 
      skip, 
      take: parseInt(pageSize),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);
  res.json({ items, total });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true, variants: true, brand: true, category: true } });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

const productSchema = z.object({
  name: z.string().min(2),
  brandId: z.number().optional(),
  categoryId: z.number().optional(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  sku: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.post('/', requireAuth, requireRole('admin','moderator'), async (req,res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const data = parsed.data;
  const product = await prisma.product.create({ data });
  res.json(product);
});

router.put('/:id', requireAuth, requireRole('admin','moderator'), async (req,res) => {
  const id = Number(req.params.id);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  res.json(product);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req,res) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
