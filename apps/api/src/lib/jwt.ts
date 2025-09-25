import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Enhanced JWT secret with fallback generation
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('  JWT_SECRET not set, using generated secret (not recommended for production)');
  return crypto.randomBytes(64).toString('hex');
})();

// Enhanced JWT signing with better security options
export function signJwt(payload: object, expiresIn = '24h') { // Reduced from 7d to 24h
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn,
    issuer: 'sneakershop-api',
    audience: 'sneakershop-client',
    algorithm: 'HS256'
  });
}

export function verifyJwt<T = any>(token: string): T | null {
  try { 
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'sneakershop-api',
      audience: 'sneakershop-client',
      algorithms: ['HS256']
    }) as T; 
  }
  catch (error) {
    console.warn('JWT verification failed:', error.message);
    return null; 
  }
}

// Additional security: Generate refresh token
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Additional security: Generate access token with shorter expiry
export function signAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '15m', // Short-lived access token
    issuer: 'sneakershop-api',
    audience: 'sneakershop-client',
    algorithm: 'HS256'
  });
}
