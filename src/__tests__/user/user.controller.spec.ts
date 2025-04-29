import { Request, Response, NextFunction } from 'express';
import * as UserController from '../../controllers/user.controller';
import { userService } from '../../controllers/user.controller';
import { authService } from '../../controllers/user.controller';
import { authorizationService } from '../../controllers/user.controller';

jest.mock('../../services/user.service');
jest.mock('../../services/auth.service');
jest.mock('../../services/authorization.service');

describe('🧪 User Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = { body: {}, params: {}, query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  // 🧪 handleCreateUser
  describe('handleCreateUser', () => {
    it('should create a user successfully', async () => {
      mockRequest.body = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'Password123!',
      };

      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.createUser as jest.Mock).mockResolvedValue({
        id: '123',
        name: 'TestUser',
        email: 'test@example.com',
      });
      (authService.generateToken as jest.Mock).mockReturnValue('mock-token');
      (authorizationService.setRole as jest.Mock).mockResolvedValue(undefined);

      const createUserFn = UserController.handleCreateUser('utilisateur');
      await createUserFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'new account successfully created',
        data: { id: '123', name: 'TestUser', email: 'test@example.com' },
        role: 'utilisateur',
        token: 'mock-token',
      });
    });

    it('should return 400 if email is already used', async () => {
      mockRequest.body = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(false);

      const createUserFn = UserController.handleCreateUser('utilisateur');
      await createUserFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already used',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.body = {
        name: 'TestUser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      (userService.isEmailUnique as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      const createUserFn = UserController.handleCreateUser('utilisateur');
      await createUserFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  // 🧪 handleGetUser
  describe('handleGetUser', () => {
    it('should return 400 if no id', async () => {
      mockRequest.params = {};

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '1' };
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 with user', async () => {
      const user = { id: '1', name: 'John', email: 'john@example.com' };
      mockRequest.params = { id: '1' };
      (userService.getUserById as jest.Mock).mockResolvedValue(user);

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      (userService.getUserById as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // 🧪 handleUpdateUser
  describe('handleUpdateUser', () => {
    it('should return 400 if no id', async () => {
      mockRequest.params = {};

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if no fields to update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email already exists', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'used@mail.com' };
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(false);

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not found during update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'UpdatedName' };
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.updateUser as jest.Mock).mockResolvedValue(null);

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 if user updated', async () => {
      const updatedUser = {
        id: '1',
        name: 'Updated',
        email: 'updated@mail.com',
      };
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated' };
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: updatedUser,
        message: 'User updated successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Boom', email: 'boom@mail.com' };
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.updateUser as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  // 🧪 handleChangePassword
  describe('handleChangePassword', () => {
    it('should return 400 if missing fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if change failed', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentPassword: 'old', newPassword: 'new' };
      (userService.changePassword as jest.Mock).mockResolvedValue(false);

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 if password changed', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentPassword: 'old', newPassword: 'new' };
      (userService.changePassword as jest.Mock).mockResolvedValue(true);

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentPassword: 'fail', newPassword: 'fail' };
      (userService.changePassword as jest.Mock).mockRejectedValue(
        new Error('Fail')
      );

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // 🧪 handleDeleteUser
  describe('handleDeleteUser', () => {
    it('should return 400 if no id', async () => {
      mockRequest.params = {};

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user not deleted', async () => {
      mockRequest.params = { id: '1' };
      (userService.deleteUser as jest.Mock).mockResolvedValue(false);

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should return 200 if user deleted', async () => {
      mockRequest.params = { id: '1' };
      (userService.deleteUser as jest.Mock).mockResolvedValue(true);

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.params = { id: '1' };
      (userService.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Fail')
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  // 🧪 handleSearchUsers
  describe('handleSearchUsers', () => {
    it('should return 400 if no searchTerm', async () => {
      mockRequest.query = {};

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 with results', async () => {
      const results = [{ id: '1', name: 'X', email: 'x@x.com' }];
      mockRequest.query = { searchTerm: 'x', limit: '5', offset: '0' };
      (userService.searchUsers as jest.Mock).mockResolvedValue(results);

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        users: results,
        pagination: { limit: 5, offset: 0, count: 1 },
      });
    });

    it('should return 500 if service returns invalid users', async () => {
      mockRequest.query = { searchTerm: 'x', limit: '5', offset: '0' };
      (userService.searchUsers as jest.Mock).mockResolvedValue(null);

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should return 500 if service throws', async () => {
      mockRequest.query = { searchTerm: 'x' };
      (userService.searchUsers as jest.Mock).mockRejectedValue(
        new Error('Boom')
      );

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
