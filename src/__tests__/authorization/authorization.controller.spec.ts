import { Request, Response, NextFunction } from 'express';
import {
  handleGetRole,
  handleSetRole,
  handleHasPermission,
  authService,
} from '../../controllers/autorization.controller';

describe('Authorization Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn();

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} }; // ✅ no "locals" here
    res = { status: mockStatus, json: mockJson, locals: {} }; // ✅ locals belongs here
    next = jest.fn();

    mockStatus.mockClear();
    mockJson.mockClear();
    jest.restoreAllMocks();
  });

  describe('handleGetRole()', () => {
    it('should return 200 with user role', async () => {
      req.params = { userId: '123' };
      jest.spyOn(authService, 'getRole').mockResolvedValue('employé');

      await handleGetRole(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        userId: '123',
        role: 'employé',
      });
    });

    it('should return 404 if role is null', async () => {
      req.params = { userId: 'not-found' };
      jest.spyOn(authService, 'getRole').mockResolvedValue(null);

      await handleGetRole(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User not found or no role assigned',
      });
    });

    it('should return 500 on error', async () => {
      req.params = { userId: 'error' };
      jest
        .spyOn(authService, 'getRole')
        .mockRejectedValue(new Error('DB error'));

      await handleGetRole(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('handleSetRole()', () => {
    const middleware = handleSetRole('employé');

    it('should return 400 if user context is missing', async () => {
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Missing user context for role assignment',
      });
    });

    it('should return 201 and assign role', async () => {
      res.locals = {
        user: { id: '123', name: 'Alice', email: 'alice@example.com' },
      };
      jest.spyOn(authService, 'setRole').mockResolvedValue(true);

      await middleware(req as Request, res as Response, next);

      expect(authService.setRole).toHaveBeenCalledWith('123', 'employé');
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'User created successfully',
        user: {
          id: '123',
          name: 'Alice',
          email: 'alice@example.com',
        },
      });
    });

    it('should return 500 if role assignment fails', async () => {
      res.locals = {
        user: { id: '123', name: 'Alice', email: 'alice@example.com' },
      };
      jest.spyOn(authService, 'setRole').mockRejectedValue(new Error('Failed'));

      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('handleHasPermission()', () => {
    it('should return 400 if role is invalid', async () => {
      req.params = { userId: '123' };
      req.query = { requiredRole: 'invalid-role' };

      await handleHasPermission(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid required role',
      });
    });

    it('should return 200 with access result', async () => {
      req.params = { userId: '123' };
      req.query = { requiredRole: 'administrateur' };
      jest.spyOn(authService, 'hasPermission').mockResolvedValue(true);

      await handleHasPermission(req as Request, res as Response);

      expect(authService.hasPermission).toHaveBeenCalledWith(
        '123',
        'administrateur'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        userId: '123',
        requiredRole: 'administrateur',
        hasAccess: true,
      });
    });

    it('should return 500 on service error', async () => {
      req.params = { userId: '123' };
      req.query = { requiredRole: 'employé' };
      jest
        .spyOn(authService, 'hasPermission')
        .mockRejectedValue(new Error('Oops'));

      await handleHasPermission(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});
