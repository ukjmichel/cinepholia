// src/services/auth.service.ts
import * as jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { UserInterface, UserPayload } from '../interfaces/user.interface';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiration: number;

  /**
   * Initialize authentication service
   * @param jwtSecret Secret key for JWT signing
   * @param tokenExpiration Token expiration time in seconds (default: 3600 = 1 hour)
   */
  constructor(
    jwtSecret: string = process.env.JWT_SECRET || 'your_default_secret',
    tokenExpiration: number = 3600
  ) {
    this.jwtSecret = jwtSecret;
    this.tokenExpiration = tokenExpiration;
  }

  /**
   * Generate JWT token with safe user payload
   * @param user User object containing sensitive information
   * @returns Signed JWT token
   */
  generateToken(user: UserInterface): string {
    const payload: UserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // Type assertion for the secret and use numeric value for expiresIn
    return jwt.sign(
      payload,
      this.jwtSecret as Secret,
      { expiresIn: this.tokenExpiration } // Numeric value in seconds
    );
  }

  /**
   * Verify JWT token and return decoded payload or null
   * @param token JWT token to verify
   * @returns Decoded user payload or null if invalid
   */
  verifyToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret as Secret) as UserPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Authenticate user with email and password
   * @param email User's email address
   * @param password User's password
   * @returns Object containing token and safe user data, or null if authentication fails
   */
  async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: UserPayload;
  } | null> {
    // Find user by email
    const user = await UserModel.findOne({
      where: { email },
    });

    // Return null if user not found
    if (!user) return null;

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) return null;

    // Generate token
    const token = this.generateToken(user);

    // Create safe user object without sensitive data
    const safeUser: UserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { token, user: safeUser };
  }

  /**
   * Refresh a user's token
   * @param userId User ID to refresh token for
   * @returns New token and user data, or null if user not found
   */
  async refreshToken(userId: string): Promise<{
    token: string;
    user: UserPayload;
  } | null> {
    const user = await UserModel.findByPk(userId);

    if (!user) return null;

    const token = this.generateToken(user);
    const safeUser: UserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { token, user: safeUser };
  }
}
