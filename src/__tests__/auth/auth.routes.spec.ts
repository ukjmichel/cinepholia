import request from 'supertest';
import express from 'express';
import * as authService from '../../services/auth.service';
import { loginController } from '../../controllers/auth.controller';

// Mock du service d'authentification
jest.mock('../../services/auth.service');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Création d'un routeur express pour les tests
const authRouter = express.Router();
authRouter.post('/login', loginController);

// Configuration de l'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Email and password are required'
      );
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Email and password are required'
      );
    });

    it('should return 401 when credentials are invalid', async () => {
      // Mock de la fonction login pour retourner null (échec d'authentification)
      mockAuthService.login.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid email or password');
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword'
      );
    });

    it('should return 200 and token when credentials are valid', async () => {
      // Mock de la fonction login pour retourner un résultat valide
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockToken = 'jwt.token.here';
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'correctpassword' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: mockToken,
        user: mockUser,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'correctpassword'
      );
    });

    it('should return 500 when login service throws an error', async () => {
      // Mock de la fonction login pour lancer une erreur
      mockAuthService.login.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Internal server error');
    });
  });
});
