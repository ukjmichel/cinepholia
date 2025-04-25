import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { UserInterface } from '../interfaces/user.interface';

/**
 * Middleware to verify JWT token from Authorization header.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  // ✅ Attach decoded user data to request object
  req.user = decoded as UserInterface;

  next();
};
