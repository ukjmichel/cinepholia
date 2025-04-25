import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { UserInterface, UserPayload } from '../interfaces/user.interface';

// Load secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // fallback for dev

/**
 * Generate JWT token with safe user payload
 */
const generateToken = (user: UserInterface): string => {
  const payload: UserPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Verify JWT token and return decoded payload or null
 */
function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Handle login by checking user credentials and returning token
 */
async function login(
  name: string = '',
  email: string = '',
  password: string = ''
): Promise<{
  token: string;
  user: UserPayload;
} | null> {
  const user = await UserModel.findOne({
    where: { email: email },
  });

  if (!user) return null;

  const isValid = await user.validatePassword(password);
  if (!isValid) return null;

  const token = generateToken(user);
  const safeUser: UserPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return { token, user: safeUser };
}

export { login, verifyToken };
