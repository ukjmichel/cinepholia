import { Request, Response, NextFunction } from 'express';
import { Permission } from '../../middlewares/authorization.middleware'; // Adjust path if needed
import { AuthorizationService } from '../../../src/services/authorization.service';

// 🧪 Mock AuthorizationService
jest.mock('../../../src/services/authorization.service');
const MockAuthorizationService = AuthorizationService as jest.MockedClass<
  typeof AuthorizationService
>;

describe('Permission middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn();
  const mockSend = jest.fn();

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      user: undefined,
    };
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    next = jest.fn();

    mockStatus.mockClear();
    mockJson.mockClear();
    mockSend.mockClear();
    next.mockClear();

    (MockAuthorizationService.prototype.hasPermission as jest.Mock).mockReset();
    (MockAuthorizationService.prototype.getRole as jest.Mock).mockReset();
  });

  // 👉 Helper to create a fake user
  const createMockUser = (
    id = '123',
    name = 'Test User',
    email = 'test@example.com'
  ) => ({
    id,
    name,
    email,
  });

  describe('authorize()', () => {
    it('should allow access if user has sufficient role', async () => {
      (
        MockAuthorizationService.prototype.hasPermission as jest.Mock
      ).mockResolvedValue(true);
      req.user = createMockUser();

      const middleware = Permission.authorize('employé');
      await middleware(req as Request, res as Response, next);

      expect(
        MockAuthorizationService.prototype.hasPermission
      ).toHaveBeenCalledWith('123', 'employé');
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 403 if user has insufficient role', async () => {
      (
        MockAuthorizationService.prototype.hasPermission as jest.Mock
      ).mockResolvedValue(false);
      req.user = createMockUser();

      const middleware = Permission.authorize('administrateur');
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Forbidden: insufficient role',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is missing', async () => {
      const middleware = Permission.authorize('utilisateur');
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Unauthorized: user not found in token',
      });
    });

    it('should return 500 if hasPermission throws', async () => {
      (
        MockAuthorizationService.prototype.hasPermission as jest.Mock
      ).mockRejectedValue(new Error('DB error'));
      req.user = createMockUser();

      const middleware = Permission.authorize('administrateur');
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('selfOrAdmin()', () => {
    it('should allow access if user is self', async () => {
      req.params = { id: '123' };
      req.user = createMockUser('123');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow access if user is admin', async () => {
      req.params = { id: 'other' };
      req.user = createMockUser('admin-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('administrateur');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(MockAuthorizationService.prototype.getRole).toHaveBeenCalledWith(
        'admin-id'
      );
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not self and not admin', async () => {
      req.params = { id: '456' };
      req.user = createMockUser('123');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('utilisateur');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Forbidden: not owner or admin',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is missing', async () => {
      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Unauthorized: user not found in token',
      });
    });

    it('should return 400 if target user ID is missing', async () => {
      req.user = createMockUser('123');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Missing target user ID in route params',
      });
    });

    it('should return 500 if getRole throws', async () => {
      req.params = { id: '456' };
      req.user = createMockUser('123');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockRejectedValue(new Error('DB error'));

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });
});
