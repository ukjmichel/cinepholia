// src/__tests__/auth/auth.middleware.spec.ts
import {
  authenticateJwt,
  optionalAuthentication,
} from '../../middlewares/auth.middleware';
import {AuthService} from '../../services/auth.service';
import * as AuthMiddleware from '../../middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../../interfaces/user.interface';

// Mock the entire AuthService module
jest.mock('../../services/auth.service');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let mockVerifyToken: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    // Setup request
    req = { headers: {} };

    // Setup response
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup next function
    next = jest.fn();

    // Setup fresh mock
    mockVerifyToken = jest.fn();

    // ⚡ THIS IS IMPORTANT:
    AuthMiddleware.authService.verifyToken = mockVerifyToken;
  });

  describe('authenticateJwt', () => {
    it('should return 401 if Authorization header is missing', () => {
      authenticateJwt(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Authorization token is required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if Authorization header is malformed', () => {
      req.headers = { authorization: 'Token something' };

      authenticateJwt(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Authorization token is required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid.token' };

      // Mock verifyToken to return null (invalid token)
      mockVerifyToken.mockReturnValue(null);

      authenticateJwt(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid or expired token',
      });
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid.token');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and set req.user if token is valid', () => {
      req.headers = { authorization: 'Bearer valid.token' };

      const decodedUser: UserPayload = {
        id: 'uuid-123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Mock verifyToken to return user payload
      mockVerifyToken.mockReturnValue(decodedUser);

      authenticateJwt(req as Request, res as Response, next);

      expect(req.user).toEqual(decodedUser);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid.token');
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthentication', () => {
    it('should call next() if Authorization header is missing', () => {
      optionalAuthentication(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should call next() without setting user if Authorization header is malformed', () => {
      req.headers = { authorization: 'Token something' };

      optionalAuthentication(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it('should call next() without setting user if token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid.token' };

      // Mock verifyToken to return null (invalid token)
      mockVerifyToken.mockReturnValue(null);

      optionalAuthentication(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
      expect(statusMock).not.toHaveBeenCalled();
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid.token');
    });

    it('should call next() and set req.user if token is valid', () => {
      req.headers = { authorization: 'Bearer valid.token' };

      const decodedUser: UserPayload = {
        id: 'uuid-123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Mock verifyToken to return user payload
      mockVerifyToken.mockReturnValue(decodedUser);

      optionalAuthentication(req as Request, res as Response, next);

      expect(req.user).toEqual(decodedUser);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid.token');
      expect(next).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
