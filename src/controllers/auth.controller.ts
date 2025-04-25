import { Request, Response } from 'express';
import { login, verifyToken } from '../services/auth.service';

/**
 * Contrôleur pour gérer la connexion d'un utilisateur
 * @route POST /auth/login
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, email, password } = req.body;

  // Validation basique
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email and password are required.' });
  }

  try {
    const result = await login(name, email, password);

    if (!result) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('LoginController error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Contrôleur pour vérifier un token (optionnel, pour des routes de debug ou de test)
 * @route GET /auth/verify
 */
export const verifyTokenController = (req: Request, res: Response) => {
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

  return res.status(200).json({ message: 'Token is valid.', decoded });
};
