// src/__tests__/routes/auth.routes.spec.ts
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
      // Mock implementation for the controller
      (mockAuthController.handleLogin as jest.Mock).mockImplementation(
        (req, res) => {
          // Simulate a successful response
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

      // Verify the controller was called
      expect(mockAuthController.handleLogin).toHaveBeenCalled();

      // Verify the response was as expected
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'test.token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });
  });

  describe('POST /auth/verify', () => {
    it('should call handleVerifyToken controller with request and response', async () => {
      // Mock implementation for the controller
      (mockAuthController.handleVerifyToken as jest.Mock).mockImplementation(
        (req, res) => {
          // Simulate a successful response
          res.status(200).json({
            message: 'Token is valid',
            user: { id: '123', name: 'Test User', email: 'test@example.com' },
          });
        }
      );

      const response = await request(app)
        .post('/auth/verify')
        .send({ token: 'valid.token' });

      // Verify the controller was called
      expect(mockAuthController.handleVerifyToken).toHaveBeenCalled();

      // Verify the response was as expected
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Token is valid',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call handleRefreshToken controller with request and response', async () => {
      // Mock implementation for the controller
      (mockAuthController.handleRefreshToken as jest.Mock).mockImplementation(
        (req, res) => {
          // Simulate a successful response
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

      // Verify the controller was called
      expect(mockAuthController.handleRefreshToken).toHaveBeenCalled();

      // Verify the response was as expected
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Token refreshed',
        token: 'new.token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      });
    });
  });

  // Additional tests for error scenarios
  describe('Error handling', () => {
    it('should handle authentication failure', async () => {
      // Mock implementation for failed authentication
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
      // Mock implementation for invalid token
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

    it('should handle missing required fields', async () => {
      // Mock implementation for missing fields
      (mockAuthController.handleLogin as jest.Mock).mockImplementation(
        (req, res) => {
          res.status(400).json({ message: 'Email and password are required' });
        }
      );

      const response = await request(app).post('/auth/login').send({
        /* empty request body */
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });
  });
});
