/**
 * Authentication Middleware
 * Verifies JWT tokens for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Secret key for JWT - MUST be set in production via environment variable
const DEFAULT_SECRET = 'infinity-game-dev-secret-2026';
export const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
export const JWT_EXPIRES_IN = '7d';

// Warn if using default secret in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: JWT_SECRET environment variable not set! Using insecure default.');
  console.error('⚠️  Set JWT_SECRET for production deployment.');
}

export interface JWTPayload {
  userId: string;
  username: string;
}

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
