import { NextFunction, Request, Response } from 'express';
import { AuthorizationService } from '../services/authorization.service';
import { Role } from '../models/authorization.model';
import UserService from '../services/user.service';

export const userService = new UserService();

export const authService = new AuthorizationService();

/**
 * Get the role of a user by ID.
 */
export const handleGetRole = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const role = await authService.getRole(userId);

    if (!role) {
      return res
        .status(404)
        .json({ message: 'User not found or no role assigned' });
    }

    return res.status(200).json({ userId, role });
  } catch (error) {
    console.error('Error getting role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Set or update the role of a user.
 */
export const handleSetRole =
  (role: Role) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = res.locals.user;

      if (!user || !user.id) {
        res
          .status(400)
          .json({ message: 'Missing user context for role assignment' });
        return;
      }

      await authService.setRole(user.id, role);

      // ✅ Réponse finale combinée avec Swagger spec
      res.status(201).json({
        message: `User created successfully`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(`Error setting role to ${role}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

/**
 * Check if a user has the required role.
 */
export const handleHasPermission = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { requiredRole } = req.query;

  if (
    !['utilisateur', 'employé', 'administrateur'].includes(
      requiredRole as string
    )
  ) {
    return res.status(400).json({ message: 'Invalid required role' });
  }

  try {
    const hasAccess = await authService.hasPermission(
      userId,
      requiredRole as Role
    );
    return res.status(200).json({ userId, requiredRole, hasAccess });
  } catch (error) {
    console.error('Error checking permission:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
