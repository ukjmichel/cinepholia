import { NextFunction, Request, Response } from 'express';
import { Role } from '../models/authorization.model';
import UserService from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthorizationService } from '../services/authorization.service';
import { EmailService } from '../services/email.service';

// Service instances
export const userService = new UserService();
export const authService = new AuthService();
export const authorizationService = new AuthorizationService();
export const emailService = new EmailService();

/**
 * Creates a new user with a specified role.
 */
export const handleCreateUser =
  (role: Role) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, password } = req.body;
      const user = await userService.createUser(username, email, password);
      await authorizationService.setRole(user.id, role);
      await emailService.sendWelcomeEmail(email, username);

      const token = authService.generateToken(user);

      res.status(201).json({
        message: 'New account successfully created',
        data: user,
        role,
        token,
      });
    } catch (error) {
      next(error);
    }
  };

/**
 * Retrieves a user by ID.
 */
export const handleGetUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a user's name and/or email.
 */
export const handleUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    res
      .status(400)
      .json({ message: 'At least one field to update is required' });
    return;
  }

  try {
    const updatedUser = await userService.updateUser(id, { name, email });
    const token = authService.generateToken(updatedUser);

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Changes a user's password.
 */
export const handleChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res
      .status(400)
      .json({ message: 'Current password and new password are required' });
    return;
  }

  try {
    await userService.changePassword(id, currentPassword, newPassword);
    const updatedUser = await userService.getUserById(id);
    const token = authService.generateToken(updatedUser);

    res.status(200).json({
      message: 'Password changed successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user by ID.
 */
export const handleDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Searches users by name or email.
 */
export const handleSearchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { searchTerm } = req.query;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const offset = req.query.offset
    ? parseInt(req.query.offset as string, 10)
    : 0;

  if (!searchTerm || typeof searchTerm !== 'string') {
    res.status(400).json({ message: 'Search term is required' });
    return;
  }

  try {
    const users = await userService.searchUsers(searchTerm, limit, offset);

    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        limit,
        offset,
        count: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
