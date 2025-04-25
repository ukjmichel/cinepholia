// src/core/Permission.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthorizationService } from '../services/authorization.service';
import { Role } from '../models/authorization.model';

const authorizationService = new AuthorizationService();

/**
 * Class containing static methods for role-based access control.
 */
export class Permission {
  /**
   * Middleware to authorize based on role hierarchy.
   * @param requiredRole The minimum role required to access the route
   */
  static authorize(requiredRole: Role): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction):Promise<any> => {
      try {
        const user = res.locals.user;

        if (!user || !user.id) {
          return res
            .status(401)
            .json({ message: 'Unauthorized: user not found in context' });
        }

        const hasAccess = await authorizationService.hasPermission(
          user.id,
          requiredRole
        );

        if (!hasAccess) {
          return res
            .status(403)
            .json({ message: 'Forbidden: insufficient role' });
        }

        next(); // Authorized
      } catch (error) {
        console.error('Permission.authorize error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };
  }

  /**
   * Middleware to allow access if user is owner or admin.
   */
  static selfOrAdmin(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction):Promise<any> => {
      try {
        const user = res.locals.user;
        const targetUserId = req.params.id;

        if (!user || !user.id) {
          return res
            .status(401)
            .json({ message: 'Unauthorized: user not found in context' });
        }

        if (!targetUserId) {
          return res
            .status(400)
            .json({ message: 'Missing target user ID in route params' });
        }

        if (user.id === targetUserId) {
          return next(); // Self-access
        }

        const role = await authorizationService.getRole(user.id);

        if (role === 'administrateur') {
          return next(); // Admin override
        }

        return res
          .status(403)
          .json({ message: 'Forbidden: not owner or admin' });
      } catch (error) {
        console.error('Permission.selfOrAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };
  }
}
