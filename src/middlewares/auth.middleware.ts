// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserPayload } from '../interfaces/user.interface';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Singleton AuthService instance
export const authService = new AuthService();

/**
 * Extract and verify JWT token from Authorization header.
 * @param req Express Request
 * @returns User payload if valid, otherwise null
 */
function getTokenPayload(req: Request): UserPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return authService.verifyToken(token) || null;
}

/**
 * Middleware to strictly authenticate a request using JWT.
 * Rejects if no valid token is found.
 */
export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const payload = getTokenPayload(req);

  if (!payload) {
    res
      .status(401)
      .json({ message: 'Authorization token is missing, invalid or expired' });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware to optionally authenticate a request.
 * If token is valid, attaches user to request; otherwise, continues silently.
 */
export function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const payload = getTokenPayload(req);
  if (payload) {
    req.user = payload;
  }
  next();
}
