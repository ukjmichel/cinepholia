import request from 'supertest';
import express from 'express';
import * as AuthController from '../../controllers/auth.controller';
import authRouter from '../../routes/auth.routes';

// Mock the auth controller methods
jest.mock('../../controllers/auth.controller');
const mockAuthController = AuthController as jest.Mocked<typeof AuthController>;

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should call handleLogin controller with request and response', async () => {
      (mockAuthController.handleLogin as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(200).json({
            message: 'Login successful',
            token: 'test.token',
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
          });
        }
      );

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(mockAuthController.handleLogin).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'test.token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Email is required', path: 'email' }),
        ])
      );
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Email must be valid',
            path: 'email',
          }),
        ])
      );
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password is required',
            path: 'password',
          }),
        ])
      );
    });

    it('should return 400 if password contains spaces', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'invalid password' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password must not contain spaces',
            path: 'password',
          }),
        ])
      );
    });
  });

  describe('POST /auth/verify', () => {
    it('should call handleVerifyToken controller with request and response', async () => {
      (mockAuthController.handleVerifyToken as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(200).json({
            message: 'Token is valid',
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
          });
        }
      );

      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'valid.token' });

      expect(mockAuthController.handleVerifyToken).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Token is valid',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call handleRefreshToken controller with request and response', async () => {
      (mockAuthController.handleRefreshToken as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(200).json({
            message: 'Token refreshed',
            token: 'new.token',
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
          });
        }
      );

      const response = await request(app)
        .post('/auth/refresh')
        .send({ userId: '123' });

      expect(mockAuthController.handleRefreshToken).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Token refreshed',
        token: 'new.token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });
  });

  describe('Error handling', () => {
    it('should handle authentication failure', async () => {
      (mockAuthController.handleLogin as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(401).json({ message: 'Invalid email or password' });
        }
      );

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should handle invalid token', async () => {
      (mockAuthController.handleVerifyToken as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(401).json({ message: 'Invalid token' });
        }
      );

      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'invalid.token' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid token');
    });
  });
});
