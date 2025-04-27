import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthorizationService } from '../services/authorization.service';
import { Role } from '../models/authorization.model';
import { BookingService } from '../services/booking.service';

const authorizationService = new AuthorizationService();
const bookingService = new BookingService();

/**
 * Class containing static methods for role-based access control.
 */
export class Permission {
  /**
   * Middleware to authorize based on role hierarchy.
   * @param requiredRole The minimum role required to access the route
   */
  static authorize(requiredRole: Role): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        const user = req.user;

        if (!user || !user.id) {
          res
            .status(401)
            .json({ message: 'Unauthorized: user not found in token' });
          return;
        }

        const hasAccess = await authorizationService.hasPermission(
          user.id,
          requiredRole
        );

        if (!hasAccess) {
          res.status(403).json({ message: 'Forbidden: insufficient role' });
          return;
        }

        next();
      } catch (error) {
        console.error('Permission.authorize error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
    };
  }

  /**
   * Middleware to allow access if user is self or has role 'administrateur'.
   */
  static selfOrAdmin(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        const user = req.user;
        const targetUserId = req.params.id || req.params.userId; // 📌 Support multiple params

        if (!user || !user.id) {
          res
            .status(401)
            .json({ message: 'Unauthorized: user not found in token' });
          return;
        }

        if (!targetUserId) {
          res
            .status(400)
            .json({ message: 'Missing target user ID in route params' });
          return;
        }

        if (user.id === targetUserId) {
          return next(); // Self-access
        }

        const role = await authorizationService.getRole(user.id);

        if (role === 'administrateur') {
          return next(); // Admin override
        }

        res.status(403).json({ message: 'Forbidden: not owner or admin' });
        return;
      } catch (error) {
        console.error('Permission.selfOrAdmin error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
    };
  }

  /**
   * Middleware to allow access if user is self or has role 'employé' or 'administrateur'.
   */
  static selfOrStaff(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        const user = req.user;
        const targetUserId = req.params.id || req.params.userId;

        if (!user || !user.id) {
          res
            .status(401)
            .json({ message: 'Unauthorized: user not found in token' });
          return;
        }

        if (!targetUserId) {
          res
            .status(400)
            .json({ message: 'Missing target user ID in route params' });
          return;
        }

        if (user.id === targetUserId) {
          return next(); // Self-access
        }

        const role = await authorizationService.getRole(user.id);

        if (role === 'employé' || role === 'administrateur') {
          return next(); // Staff or Admin
        }

        res.status(403).json({ message: 'Forbidden: not owner or staff' });
        return;
      } catch (error) {
        console.error('Permission.selfOrStaff error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
    };
  }

  /**
   * Middleware to allow access if the user is the booking owner or has role 'employé' or 'administrateur'.
   */
  static isBookingOwnerOrStaff(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        const user = req.user;
        const bookingId = req.params.bookingId;

        if (!user || !user.id) {
          res
            .status(401)
            .json({ message: 'Unauthorized: user not found in token' });
          return;
        }

        if (!bookingId) {
          res
            .status(400)
            .json({ message: 'Missing booking ID in route params' });
          return;
        }

        const booking = await bookingService.getBookingById(bookingId);

        if (!booking) {
          res.status(404).json({ message: 'Booking not found' });
          return;
        }

        if (user.id === booking.userId) {
          return next(); // Self-owner
        }

        const role = await authorizationService.getRole(user.id);

        if (role === 'employé' || role === 'administrateur') {
          return next(); // Staff or Admin
        }

        res.status(403).json({ message: 'Forbidden: not owner or staff' });
        return;
      } catch (error) {
        console.error('Permission.isBookingOwnerOrStaff error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
    };
  }

  /**
   * Middleware to forbid access for staff users (employé or administrateur).
   */
  static isNotStaff(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        const user = req.user;
        if (!user || !user.id) {
          res
            .status(401)
            .json({ message: 'Unauthorized: user not found in token' });
          return;
        }

        const role = await authorizationService.getRole(user.id);

        if (role === 'employé' || role === 'administrateur') {
          res
            .status(403)
            .json({ message: 'Forbidden: staff cannot perform this action' });
          return;
        }

        next();
      } catch (error) {
        console.error('Permission.isNotStaff error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }
    };
  }
}
