import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../lib/jwt.js';

export interface AuthUser {
  id: number;
  role: 'customer' | 'moderator' | 'admin';
  email: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[process.env.COOKIE_NAME || 'sneakershop_jwt'];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyJwt<AuthUser>(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  (req as any).user = payload;
  next();
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
