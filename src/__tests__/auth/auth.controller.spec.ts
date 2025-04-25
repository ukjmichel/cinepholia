import {
  loginController,
  verifyTokenController,
} from '../../controllers/auth.controller';
import * as authService from '../../services/auth.service';
import { Request, Response } from 'express';
import { UserPayload } from '../../interfaces/user.interface';

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('loginController', () => {
    it('should return 400 if email or password is missing', async () => {
      req.body = {};
      await loginController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Email and password are required.',
      });
    });

    it('should return 401 if login fails', async () => {
      req.body = { email: 'test@example.com', password: 'wrong' };
      jest.spyOn(authService, 'login').mockResolvedValue(null);

      await loginController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid email or password.',
      });
    });

    it('should return 200 if login is successful', async () => {
      req.body = { email: 'test@example.com', password: 'correct' };
      jest.spyOn(authService, 'login').mockResolvedValue({
        token: 'valid.token',
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
          name: 'Test User', // Add the missing property
        },
      });

      await loginController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'valid.token',
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
          name: 'Test User', // Match in the expectation too
        },
      });
    });

    it('should return 500 if an error occurs', async () => {
      req.body = { email: 'test@example.com', password: 'error' };
      jest.spyOn(authService, 'login').mockRejectedValue(new Error('DB error'));

      await loginController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Internal server error.',
      });
    });
  });

  describe('verifyTokenController', () => {
    it('should return 401 if Authorization header is missing', () => {
      req.headers = {};
      verifyTokenController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Missing or invalid Authorization header.',
      });
    });

    it('should return 401 if token is invalid', () => {
      req.headers = { authorization: 'Bearer invalid.token' };
      jest.spyOn(authService, 'verifyToken').mockReturnValue(null);

      verifyTokenController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid or expired token.',
      });
    });

    it('should return 200 if token is valid', () => {
      req.headers = { authorization: 'Bearer valid.token' };
      jest.spyOn(authService, 'verifyToken').mockReturnValue({
        id: 'uuid-123',
        email: 'test@example.com',
        name: 'Test User', // Add missing properties to match UserPayload interface
      });

      verifyTokenController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Token is valid.',
        decoded: {
          id: 'uuid-123',
          email: 'test@example.com',
          name: 'Test User', // Match in the expectation too
        },
      });
    });
  });
});
