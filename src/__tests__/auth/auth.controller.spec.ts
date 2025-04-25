// src/__tests__/auth/auth.controller.spec.ts
import { Request, Response } from 'express';
import * as AuthController from '../../controllers/auth.controller';
import AuthService from '../../services/auth.service';

// Mock the AuthService module
jest.mock('../../services/auth.service');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject = {};
  let mockLogin: jest.Mock;
  let mockVerifyToken: jest.Mock;
  let mockRefreshToken: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };

    mockLogin = jest.fn();
    mockVerifyToken = jest.fn();
    mockRefreshToken = jest.fn();

    // ⚡ THIS IS THE IMPORTANT PART:
    AuthController.authService.login = mockLogin;
    AuthController.authService.verifyToken = mockVerifyToken;
    AuthController.authService.refreshToken = mockRefreshToken;
  });

  describe('handleLogin', () => {
    it('should return 400 if email or password is missing', async () => {
      // Setup mock request with missing credentials
      mockRequest = {
        body: {
          // email is missing
          password: 'password123',
        },
      };

      await AuthController.handleLogin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email and password are required',
      });
    });

    it('should return 401 if login fails (invalid credentials)', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'wrong_password',
        },
      };

      // Mock login to return null (authentication failed)
      mockLogin.mockResolvedValue(null);

      await AuthController.handleLogin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogin).toHaveBeenCalledWith(
        'test@example.com',
        'wrong_password'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid email or password',
      });
    });

    it('should return 200 with token and user data when login succeeds', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'correct_password',
        },
      };

      // Mock successful login result
      const mockLoginResult = {
        token: 'valid.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      // Mock login to return success result
      mockLogin.mockResolvedValue(mockLoginResult);

      await AuthController.handleLogin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogin).toHaveBeenCalledWith(
        'test@example.com',
        'correct_password'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'valid.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });
    });

    it('should return 500 when service throws an error', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      // Mock login to throw error
      mockLogin.mockRejectedValue(new Error('Database error'));

      // Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await AuthController.handleLogin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleVerifyToken', () => {
    it('should return 400 if token is missing', async () => {
      // Setup mock request with missing token
      mockRequest = {
        body: {},
      };

      await AuthController.handleVerifyToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token is required',
      });
    });

    it('should return 401 if token is invalid', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          token: 'invalid.token',
        },
      };

      // Mock verifyToken to return null (invalid token)
      mockVerifyToken.mockReturnValue(null);

      await AuthController.handleVerifyToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockVerifyToken).toHaveBeenCalledWith('invalid.token');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token',
      });
    });

    it('should return 200 with user data when token is valid', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          token: 'valid.token',
        },
      };

      // Mock payload from valid token
      const mockPayload = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Mock verifyToken to return payload
      mockVerifyToken.mockReturnValue(mockPayload);

      await AuthController.handleVerifyToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockVerifyToken).toHaveBeenCalledWith('valid.token');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token is valid',
        user: mockPayload,
      });
    });
  });

  describe('handleRefreshToken', () => {
    it('should return 400 if userId is missing', async () => {
      // Setup mock request with missing userId
      mockRequest = {
        body: {},
      };

      await AuthController.handleRefreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 404 if user is not found', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          userId: 'nonexistent',
        },
      };

      // Mock refreshToken to return null (user not found)
      mockRefreshToken.mockResolvedValue(null);

      await AuthController.handleRefreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRefreshToken).toHaveBeenCalledWith('nonexistent');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 200 with new token and user data when refresh succeeds', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          userId: '123',
        },
      };

      // Mock successful refresh result
      const mockRefreshResult = {
        token: 'new.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      // Mock refreshToken to return success result
      mockRefreshToken.mockResolvedValue(mockRefreshResult);

      await AuthController.handleRefreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockRefreshToken).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token refreshed',
        token: 'new.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });
    });

    it('should return 500 when service throws an error', async () => {
      // Setup mock request
      mockRequest = {
        body: {
          userId: '123',
        },
      };

      // Mock refreshToken to throw error
      mockRefreshToken.mockRejectedValue(new Error('Database error'));

      // Spy on console.error
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await AuthController.handleRefreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
