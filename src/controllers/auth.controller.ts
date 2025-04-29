// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import {AuthService} from '../services/auth.service';

// Export the auth service instance for testing - this is key!
export const authService = new AuthService();

/**
 * Handle user login
 * @param req Express request object
 * @param res Express response object
 */
export async function handleLogin(req: Request, res: Response): Promise<any> {
  const { email, password } = req.body;

  try {
    // Attempt to authenticate user
    const result = await authService.login(email, password);

    // Return error if authentication failed
    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return token and user data
    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle token verification
 * @param req Express request object
 * @param res Express response object
 */
export async function handleVerifyToken(
  req: Request,
  res: Response
): Promise<any> {
  const { token } = req.body;

  // Validate input
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify token
    const payload = authService.verifyToken(token);

    // Return error if token is invalid
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Return user data from token
    return res.status(200).json({
      message: 'Token is valid',
      user: payload,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Handle token refresh
 * @param req Express request object
 * @param res Express response object
 */
export async function handleRefreshToken(
  req: Request,
  res: Response
): Promise<any> {
  const { userId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Attempt to refresh token
    const result = await authService.refreshToken(userId);

    // Return error if user not found
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return new token and user data
    return res.status(200).json({
      message: 'Token refreshed',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
