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
 * @param role - The role to assign to the user
 * @returns Express handler function
 */
export const handleCreateUser =
  (role: Role) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username, email, password } = req.body;

    try {
      const emailIsUnique = await userService.isEmailUnique(email);
      if (!emailIsUnique) {
        res.status(400).json({ message: 'Email already used' });
        return;
      }

      const user = await userService.createUser(username, email, password);
      authorizationService.setRole(user.id, role);
      const token = authService.generateToken(user);
      emailService.sendWelcomeEmail(email, username);

      res.status(201).json({
        message: 'New account successfully created',
        data: user,
        role,
        token,
      });
    } catch (error) {
      console.error('User creation failed:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

/**
 * Retrieves a user by ID.
 * @param req - Express request
 * @param res - Express response
 */
export async function handleGetUser(req: Request, res: Response): Promise<any> {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Updates a user's name and/or email.
 * Returns a new JWT token after successful update.
 * @param req - Express request
 * @param res - Express response
 */
export async function handleUpdateUser(
  req: Request,
  res: Response
): Promise<any> {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!name && !email) {
    return res
      .status(400)
      .json({ message: 'At least one field to update is required' });
  }

  try {
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSameName = name ? name === existingUser.name : true;
    const isSameEmail = email ? email === existingUser.email : true;

    if (isSameName && isSameEmail) {
      return res
        .status(400)
        .json({ message: 'No changes detected in provided data' });
    }

    if (email && email !== existingUser.email) {
      const emailIsUnique = await userService.isEmailUnique(email);
      if (!emailIsUnique) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedUser = await userService.updateUser(id, { name, email });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    const freshUser = await userService.getUserById(id);
    if (!freshUser) {
      return res.status(500).json({ message: 'Failed to fetch updated user' });
    }

    const newToken = authService.generateToken(freshUser);

    return res.status(200).json({
      user: freshUser,
      message: 'User updated successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Changes a user's password.
 * Returns a new JWT token after successful password change.
 * @param req - Express request
 * @param res - Express response
 */
export async function handleChangePassword(
  req: Request,
  res: Response
): Promise<any> {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Current password and new password are required' });
  }

  try {
    const success = await userService.changePassword(
      id,
      currentPassword,
      newPassword
    );

    if (!success) {
      return res
        .status(400)
        .json({ message: 'Invalid current password or user not found' });
    }

    const updatedUser = await userService.getUserById(id);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to generate token' });
    }

    const newToken = authService.generateToken(updatedUser);

    return res.status(200).json({
      message: 'Password changed successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Deletes a user by ID.
 * @param req - Express request
 * @param res - Express response
 */
export async function handleDeleteUser(
  req: Request,
  res: Response
): Promise<any> {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const deleted = await userService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Searches users by name or email with optional pagination.
 * @param req - Express request
 * @param res - Express response
 */
export async function handleSearchUsers(
  req: Request,
  res: Response
): Promise<any> {
  const { searchTerm } = req.query;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const offset = req.query.offset
    ? parseInt(req.query.offset as string, 10)
    : 0;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const users = await userService.searchUsers(searchTerm, limit, offset);

    return res.status(200).json({
      users,
      pagination: {
        limit,
        offset,
        count: users.length,
      },
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
