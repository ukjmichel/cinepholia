// src/__tests__/authorization/authorization.middleware.spec.ts

import { Request, Response, NextFunction } from 'express';
import { Permission } from '../../middlewares/authorization.middleware';
import { AuthorizationService } from '../../services/authorization.service';
import { BookingService } from '../../services/booking.service';

// 🧪 Mocks
jest.mock('../../services/authorization.service');
jest.mock('../../services/booking.service');

const MockAuthorizationService = AuthorizationService as jest.MockedClass<
  typeof AuthorizationService
>;
const MockBookingService = BookingService as jest.MockedClass<
  typeof BookingService
>;

describe('Permission Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn();
  const mockSend = jest.fn();

  beforeEach(() => {
    req = {
      params: {},
      user: undefined,
    };
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    next = jest.fn();

    jest.clearAllMocks();
    (MockAuthorizationService.prototype.hasPermission as jest.Mock).mockReset();
    (MockAuthorizationService.prototype.getRole as jest.Mock).mockReset();
    (MockBookingService.prototype.getBookingById as jest.Mock).mockReset();
  });

  // ➡️ Helper
  const createMockUser = (
    id = '123',
    name = 'Test User',
    email = 'test@example.com'
  ) => ({
    id,
    name,
    email,
  });

  // --- Tests ---

  describe('authorize()', () => {
    it('should allow access if user has permission', async () => {
      (
        MockAuthorizationService.prototype.hasPermission as jest.Mock
      ).mockResolvedValue(true);
      req.user = createMockUser();

      const middleware = Permission.authorize('employé');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
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
    });

    it('should return 401 if no user', async () => {
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

      const middleware = Permission.authorize('employé');
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
      req.params = { id: 'other-id' };
      req.user = createMockUser('admin-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('administrateur');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not self and not admin', async () => {
      req.params = { id: 'different' };
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
    });

    it('should return 401 if no user', async () => {
      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Unauthorized: user not found in token',
      });
    });

    it('should return 400 if target user id missing', async () => {
      req.user = createMockUser('123');

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Missing target user ID in route params',
      });
    });

    it('should return 500 if getRole throws', async () => {
      req.params = { id: 'different' };
      req.user = createMockUser('123');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockRejectedValue(new Error('Error'));

      const middleware = Permission.selfOrAdmin();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('selfOrStaff()', () => {
    it('should allow access if user is self', async () => {
      req.params = { id: '123' };
      req.user = createMockUser('123');

      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow access if user is staff', async () => {
      req.params = { id: 'different' };
      req.user = createMockUser('staff-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('employé');

      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should forbid if user is not staff or self', async () => {
      req.params = { id: 'different' };
      req.user = createMockUser('user-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('utilisateur');

      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Forbidden: not owner or staff',
      });
    });

    it('should return 401 if no user', async () => {
      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('should return 400 if missing id', async () => {
      req.user = createMockUser('123');

      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should return 500 if getRole throws', async () => {
      req.params = { id: 'other' };
      req.user = createMockUser('staff-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockRejectedValue(new Error('Error'));

      const middleware = Permission.selfOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('isBookingOwnerOrStaff()', () => {
    it('should allow if user is booking owner', async () => {
      req.params = { bookingId: 'booking-123' };
      req.user = createMockUser('owner-id');

      (
        MockBookingService.prototype.getBookingById as jest.Mock
      ).mockResolvedValue({ userId: 'owner-id' });

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow if user is staff', async () => {
      req.params = { bookingId: 'booking-123' };
      req.user = createMockUser('staff-id');

      (
        MockBookingService.prototype.getBookingById as jest.Mock
      ).mockResolvedValue({ userId: 'other-id' });
      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('employé');

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should forbid if not owner or staff', async () => {
      req.params = { bookingId: 'booking-123' };
      req.user = createMockUser('user-id');

      (
        MockBookingService.prototype.getBookingById as jest.Mock
      ).mockResolvedValue({ userId: 'other-id' });
      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('utilisateur');

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
    });

    it('should return 404 if booking not found', async () => {
      req.params = { bookingId: 'booking-123' };
      req.user = createMockUser('user-id');

      (
        MockBookingService.prototype.getBookingById as jest.Mock
      ).mockResolvedValue(null);

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('should return 400 if missing bookingId', async () => {
      req.user = createMockUser('user-id');

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should return 500 if getBookingById throws', async () => {
      req.params = { bookingId: 'booking-123' };
      req.user = createMockUser('user-id');

      (
        MockBookingService.prototype.getBookingById as jest.Mock
      ).mockRejectedValue(new Error('Oops'));

      const middleware = Permission.isBookingOwnerOrStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('isNotStaff()', () => {
    it('should forbid if user is staff', async () => {
      req.user = createMockUser('staff-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('employé');

      const middleware = Permission.isNotStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Forbidden: staff cannot perform this action',
      });
    });

    it('should allow if user is regular user', async () => {
      req.user = createMockUser('user-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockResolvedValue('utilisateur');

      const middleware = Permission.isNotStaff();
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if no user', async () => {
      const middleware = Permission.isNotStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('should return 500 if getRole throws', async () => {
      req.user = createMockUser('user-id');

      (
        MockAuthorizationService.prototype.getRole as jest.Mock
      ).mockRejectedValue(new Error('Error'));

      const middleware = Permission.isNotStaff();
      await middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });
});
