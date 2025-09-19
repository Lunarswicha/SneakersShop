import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/hash.js';
import { signJwt } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/security.js';
import { z } from 'zod';

const router = Router();
const emailSchema = z.string().email();
const pwSchema = z.string().min(8);

router.post('/register', authRateLimit, async (req, res) => {
  const parse = z.object({ email: emailSchema, password: pwSchema }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already used' });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  const token = signJwt({ id: user.id, email: user.email, role: user.role });
  res.cookie(process.env.COOKIE_NAME || 'sneakershop_jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ id: user.id, email: user.email, role: user.role });
});

router.post('/login', authRateLimit, async (req, res) => {
  const parse = z.object({ email: emailSchema, password: pwSchema }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signJwt({ id: user.id, email: user.email, role: user.role });
  res.cookie(process.env.COOKIE_NAME || 'sneakershop_jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ id: user.id, email: user.email, role: user.role });
});

router.post('/logout', (_req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'sneakershop_jwt');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({ id: user.id, email: user.email, role: user.role });
});

export default router;
