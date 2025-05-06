import { Request, Response, NextFunction } from 'express';
import * as UserController from '../../controllers/user.controller';
import { NotFoundError } from '../../errors/NotFoundError';
import { BadRequestError } from '../../errors/BadRequestError';

jest.mock('../../services/user.service');
jest.mock('../../services/auth.service');
jest.mock('../../services/authorization.service');
jest.mock('../../services/email.service');

describe('🧪 User Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('handleCreateUser', () => {
    it('should create a user successfully', async () => {
      mockRequest.body = {
        username: 'TestUser',
        email: 'test@example.com',
        password: 'Password123!',
      };

      (UserController.userService.createUser as jest.Mock).mockResolvedValue({
        id: '123',
        username: 'TestUser',
        email: 'test@example.com',
      });
      (UserController.authService.generateToken as jest.Mock).mockReturnValue(
        'mock-token'
      );
      (
        UserController.authorizationService.setRole as jest.Mock
      ).mockResolvedValue(undefined);
      (
        UserController.emailService.sendWelcomeEmail as jest.Mock
      ).mockResolvedValue(undefined);

      const createUserFn = UserController.handleCreateUser('utilisateur');
      await createUserFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'New account successfully created',
          role: 'utilisateur',
          token: 'mock-token',
        })
      );
    });

    it('should call next with BadRequestError if email already used', async () => {
      mockRequest.body = {
        username: 'TestUser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      (UserController.userService.createUser as jest.Mock).mockRejectedValue(
        new BadRequestError('Email already used')
      );

      const createUserFn = UserController.handleCreateUser('utilisateur');
      await createUserFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('handleGetUser', () => {
    it('should return 200 with user', async () => {
      mockRequest.params = { id: '1' };
      const user = { id: '1', name: 'John', email: 'john@example.com' };
      (UserController.userService.getUserById as jest.Mock).mockResolvedValue(
        user
      );

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        data: user,
      });
    });

    it('should call next with NotFoundError if user not found', async () => {
      mockRequest.params = { id: '999' };
      (UserController.userService.getUserById as jest.Mock).mockRejectedValue(
        new NotFoundError('User not found')
      );

      await UserController.handleGetUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('handleUpdateUser', () => {
    it('should return 400 if no fields to update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should update user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'UpdatedName' };

      const updatedUser = {
        id: '1',
        name: 'UpdatedName',
        email: 'updated@example.com',
      };

      (UserController.userService.updateUser as jest.Mock).mockResolvedValue(
        updatedUser
      );
      (UserController.authService.generateToken as jest.Mock).mockReturnValue(
        'mock-token'
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: updatedUser,
          message: 'User updated successfully',
          token: 'mock-token',
        })
      );
    });

    it('should call next with NotFoundError if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated' };
      (UserController.userService.updateUser as jest.Mock).mockRejectedValue(
        new NotFoundError('User not found')
      );

      await UserController.handleUpdateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('handleChangePassword', () => {
    it('should return 400 if missing fields', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should change password successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentPassword: 'old', newPassword: 'new' };

      (
        UserController.userService.changePassword as jest.Mock
      ).mockResolvedValue(undefined);
      (UserController.userService.getUserById as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Updated',
        email: 'updated@example.com',
      });
      (UserController.authService.generateToken as jest.Mock).mockReturnValue(
        'mock-token'
      );

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should call next with BadRequestError if wrong current password', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentPassword: 'wrong', newPassword: 'new' };

      (
        UserController.userService.changePassword as jest.Mock
      ).mockRejectedValue(new BadRequestError('Wrong password'));

      await UserController.handleChangePassword(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('handleDeleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      (UserController.userService.deleteUser as jest.Mock).mockResolvedValue(
        undefined
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with NotFoundError if user not found', async () => {
      mockRequest.params = { id: '999' };
      (UserController.userService.deleteUser as jest.Mock).mockRejectedValue(
        new NotFoundError('User not found')
      );

      await UserController.handleDeleteUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('handleSearchUsers', () => {
    it('should return 400 if no searchTerm', async () => {
      mockRequest.query = {};

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 200 with search results', async () => {
      const users = [{ id: '1', name: 'John', email: 'john@example.com' }];
      mockRequest.query = { searchTerm: 'John' };

      (UserController.userService.searchUsers as jest.Mock).mockResolvedValue(
        users
      );

      await UserController.handleSearchUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          users,
          pagination: expect.any(Object),
        })
      );
    });
  });
});
