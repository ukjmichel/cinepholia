// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserPayload } from '../interfaces/user.interface';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Export the auth service instance for testing or reuse
export const authService = new AuthService();

/**
 * Middleware to authenticate requests using JWT token from Authorization header.
 * The token should include the user's id in its payload.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  // Check if authorization header exists and has the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token is required' });
    return;
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token using AuthService
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // Add user data (which includes the user id) to the request object
  req.user = payload;

  // Proceed to the next middleware/controller
  next();
}

/**
 * Optional authentication middleware.
 * If a valid token is provided, it adds user data to the request; otherwise,
 * it simply moves to the next middleware without rejecting the request.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  // If no authorization header or it doesn't start with 'Bearer ', move on
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token; if valid, add user to request
  const payload = authService.verifyToken(token);
  if (payload) {
    req.user = payload;
  }

  // Proceed to the next middleware/controller
  next();
}
