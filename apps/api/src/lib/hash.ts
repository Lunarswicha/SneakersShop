import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Enhanced password hashing with higher salt rounds
export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(12); // Increased from 10 to 12
  return bcrypt.hash(pw, salt);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

// Additional security: Generate secure random tokens
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Additional security: Hash sensitive data for additional protection
export function hashSensitiveData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Additional security: Generate email verification token
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Additional security: Generate password reset token
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
