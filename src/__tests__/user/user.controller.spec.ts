import { Request, Response } from 'express';
import * as UserController from '../../../src/controllers/user.controller';
import UserService from '../../../src/services/user.service';

jest.mock('../../../src/services/user.service');
const MockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let next: jest.Mock;

  const mockRes = (): Response => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: {},
    } as unknown as Response;
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = mockRes();
    next = jest.fn();
  });

  // ─────────────────────────────────────────────
  describe('handleCreateUser', () => {
    it('should return 400 if missing required fields', async () => {
      mockRequest.body = { email: 'a@a.com' };

      await UserController.handleCreateUser(
        mockRequest as Request,
        mockResponse,
        next
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email already exists', async () => {
      mockRequest.body = { name: 'A', email: 'a@a.com', password: 'pass' };
      mockRequest.params = {};
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockResolvedValue(
        false
      );

      await UserController.handleCreateUser(
        mockRequest as Request,
        mockResponse,
        next
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should create user and call next()', async () => {
      const createdUser = { id: '999', name: 'New', email: 'n@n.com' };
      mockRequest.body = { name: 'New', email: 'n@n.com', password: 'secret' };
      mockRequest.params = {};
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockResolvedValue(
        true
      );
      (MockUserService.prototype.createUser as jest.Mock).mockResolvedValue(
        createdUser
      );

      await UserController.handleCreateUser(
        mockRequest as Request,
        mockResponse,
        next
      );

      expect(mockResponse.locals.user).toBe(createdUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 500 if service throws', async () => {
      mockRequest.body = {
        name: 'Err',
        email: 'fail@mail.com',
        password: '123',
      };
      mockRequest.params = {};
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockRejectedValue(
        new Error('Oops')
      );

      await UserController.handleCreateUser(
        mockRequest as Request,
        mockResponse,
        next
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────
  describe('handleGetUser', () => {
    it('should return 400 if id is missing', async () => {
      mockRequest.params = {};

      await UserController.handleGetUser(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '123' };
      (MockUserService.prototype.getUserById as jest.Mock).mockResolvedValue(
        null
      );

      await UserController.handleGetUser(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 with user data', async () => {
      const user = { id: '123', name: 'John', email: 'john@example.com' };
      mockRequest.params = { id: '123' };
      (MockUserService.prototype.getUserById as jest.Mock).mockResolvedValue(
        user
      );

      await UserController.handleGetUser(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '123' };
      (MockUserService.prototype.getUserById as jest.Mock).mockRejectedValue(
        new Error('oops')
      );

      await UserController.handleGetUser(mockRequest as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────
  describe('handleUpdateUser', () => {
    it('should return 400 if no ID or fields', async () => {
      mockRequest.params = {};
      mockRequest.body = {};
      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email already exists', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'used@mail.com' };
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockResolvedValue(
        false
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Test' };
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockResolvedValue(
        true
      );
      (MockUserService.prototype.updateUser as jest.Mock).mockResolvedValue(
        null
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 if user updated', async () => {
      const updated = { id: '1', name: 'Updated', email: 'a@b.com' };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated' };
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockResolvedValue(
        true
      );
      (MockUserService.prototype.updateUser as jest.Mock).mockResolvedValue(
        updated
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: updated,
        message: 'User updated successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Boom', email: 'boom@mail.com' };
      (MockUserService.prototype.isEmailUnique as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────
  describe('handleChangePassword', () => {
    it('should return 400 if missing fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};
      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if change failed', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        currentPassword: 'wrong',
        newPassword: 'new',
      };
      (MockUserService.prototype.changePassword as jest.Mock).mockResolvedValue(
        false
      );

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 if password changed', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        currentPassword: 'old',
        newPassword: 'new',
      };
      (MockUserService.prototype.changePassword as jest.Mock).mockResolvedValue(
        true
      );

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        currentPassword: 'fail',
        newPassword: 'fail',
      };
      (MockUserService.prototype.changePassword as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────
  describe('handleDeleteUser', () => {
    it('should return 400 if id is missing', async () => {
      mockRequest.params = {};
      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if not deleted', async () => {
      mockRequest.params = { id: '1' };
      (MockUserService.prototype.deleteUser as jest.Mock).mockResolvedValue(
        false
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 if deleted', async () => {
      mockRequest.params = { id: '1' };
      (MockUserService.prototype.deleteUser as jest.Mock).mockResolvedValue(
        true
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      (MockUserService.prototype.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Fail')
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // ─────────────────────────────────────────────
  describe('handleSearchUsers', () => {
    it('should return 400 if no searchTerm', async () => {
      mockRequest.query = {};
      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 with results', async () => {
      const results = [{ id: '1', name: 'X', email: 'x@x.com' }];
      mockRequest.query = { searchTerm: 'x', limit: '5', offset: '0' };
      (MockUserService.prototype.searchUsers as jest.Mock).mockResolvedValue(
        results
      );

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        users: results,
        pagination: {
          limit: 5,
          offset: 0,
          count: results.length,
        },
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.query = { searchTerm: 'x' };
      (MockUserService.prototype.searchUsers as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
