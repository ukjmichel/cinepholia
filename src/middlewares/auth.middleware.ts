// First, let's fix the auth.middleware.ts file to make it more testable

// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { UserPayload } from '../interfaces/user.interface';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Export the auth service instance for testing 
export const authService = new AuthService();

/**
 * Middleware to authenticate requests using JWT token from Authorization header
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

  // Verify the token
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // Add user data to request object
  req.user = payload;

  // Proceed to the next middleware/controller
  next();
}

/**
 * Optional authentication middleware
 * Adds user to request if token is valid but does not require authentication
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

  // If no authorization header, proceed without authentication
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token
  const payload = authService.verifyToken(token);

  // If valid token, add user to request
  if (payload) {
    req.user = payload;
  }

  // Proceed to the next middleware/controller
  next();
}
