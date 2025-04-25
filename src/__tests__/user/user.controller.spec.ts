// src/__tests__/user/user.controller.spec.ts
import { Request, Response } from 'express';
import {
  handleCreateUser,
  handleGetUser,
  handleUpdateUser,
  handleChangePassword,
  handleDeleteUser,
  handleSearchUsers,
} from '../../controllers/user.controller';
import * as userService from '../../services/user.service';

// For type casting purposes
type CreateUserRequest = Request<
  {},
  {},
  { name: string; email: string; password: string }
>;

type GetUserRequest = Request<{ id: string }>;

type UpdateUserRequest = Request<
  { id: string },
  {},
  { name?: string; email?: string }
>;

type ChangePasswordRequest = Request<
  { id: string },
  {},
  { currentPassword: string; newPassword: string }
>;

type DeleteUserRequest = Request<{ id: string }>;

type SearchUsersRequest = Request<
  {},
  {},
  {},
  { searchTerm: string; limit?: string; offset?: string }
>;

// Mock the user service module
jest.mock('../../services/user.service', () => ({
  isEmailUnique: jest.fn(),
  createUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  changePassword: jest.fn(),
  deleteUser: jest.fn(),
  searchUsers: jest.fn(),
}));

describe('User Controller', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('handleCreateUser', () => {
    let mockRequest: Partial<CreateUserRequest>;

    beforeEach(() => {
      mockRequest = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        },
      };
    });

    it('should return 400 if required fields are missing', async () => {
      // Missing email
      mockRequest.body = {
        name: 'Test User',
        email: '',
        password: 'password123',
      };

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });

      // Missing name
      mockRequest.body = {
        name: '',
        email: 'test@example.com',
        password: 'password123',
      };

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Missing password
      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: '',
      };

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email is not unique', async () => {
      // Setup mock to return false (email already exists)
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(false);

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(userService.isEmailUnique).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already exists',
      });
    });

    it('should create a user and return 201 on success', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Setup mocks to succeed
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(userService.isEmailUnique).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(userService.createUser).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        'password123'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
        message: 'User created successfully',
      });
    });

    it('should return 500 if an error occurs', async () => {
      // Setup mock to throw an error
      (userService.isEmailUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleCreateUser(
        mockRequest as CreateUserRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleGetUser', () => {
    let mockRequest: Partial<GetUserRequest>;

    beforeEach(() => {
      mockRequest = {
        params: {
          id: '123',
        },
      };
    });

    it('should return 400 if id is missing', async () => {
      mockRequest.params = { id: '' };

      await handleGetUser(
        mockRequest as GetUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 404 if user is not found', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await handleGetUser(
        mockRequest as GetUserRequest,
        mockResponse as Response
      );

      expect(userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 200 and user data if found', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await handleGetUser(
        mockRequest as GetUserRequest,
        mockResponse as Response
      );

      expect(userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 500 if an error occurs', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleGetUser(
        mockRequest as GetUserRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleUpdateUser', () => {
    let mockRequest: Partial<UpdateUserRequest>;

    beforeEach(() => {
      mockRequest = {
        params: {
          id: '123',
        },
        body: {
          name: 'Updated Name',
          email: 'updated@example.com',
        },
      };
    });

    it('should return 400 if id is missing', async () => {
      mockRequest.params = { id: '' };

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 400 if no fields to update are provided', async () => {
      mockRequest.body = {};

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'At least one field to update is required',
      });
    });

    it('should check email uniqueness if email is being updated', async () => {
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(false);

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(userService.isEmailUnique).toHaveBeenCalledWith(
        'updated@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Email already exists',
      });
    });

    it('should not check email uniqueness if only name is being updated', async () => {
      mockRequest.body = { name: 'Updated Name' };
      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'original@example.com',
      };

      (userService.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(userService.isEmailUnique).not.toHaveBeenCalled();
      expect(userService.updateUser).toHaveBeenCalledWith('123', {
        name: 'Updated Name',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user is not found', async () => {
      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.updateUser as jest.Mock).mockResolvedValue(null);

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should update user and return 200 on success', async () => {
      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      (userService.isEmailUnique as jest.Mock).mockResolvedValue(true);
      (userService.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(userService.updateUser).toHaveBeenCalledWith('123', {
        name: 'Updated Name',
        email: 'updated@example.com',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUpdatedUser,
        message: 'User updated successfully',
      });
    });

    it('should return 500 if an error occurs', async () => {
      (userService.isEmailUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleUpdateUser(
        mockRequest as UpdateUserRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleChangePassword', () => {
    let mockRequest: Partial<ChangePasswordRequest>;

    beforeEach(() => {
      mockRequest = {
        params: {
          id: '123',
        },
        body: {
          currentPassword: 'oldPassword',
          newPassword: 'newPassword',
        },
      };
    });

    it('should return 400 if id is missing', async () => {
      mockRequest.params = { id: '' };

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 400 if passwords are missing', async () => {
      mockRequest.body = { currentPassword: '', newPassword: 'newPassword' };

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Current password and new password are required',
      });

      mockRequest.body = { currentPassword: 'oldPassword', newPassword: '' };

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if password change fails', async () => {
      (userService.changePassword as jest.Mock).mockResolvedValue(false);

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(userService.changePassword).toHaveBeenCalledWith(
        '123',
        'oldPassword',
        'newPassword'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid current password or user not found',
      });
    });

    it('should return 200 on successful password change', async () => {
      (userService.changePassword as jest.Mock).mockResolvedValue(true);

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(userService.changePassword).toHaveBeenCalledWith(
        '123',
        'oldPassword',
        'newPassword'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password changed successfully',
      });
    });

    it('should return 500 if an error occurs', async () => {
      (userService.changePassword as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleChangePassword(
        mockRequest as ChangePasswordRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleDeleteUser', () => {
    let mockRequest: Partial<DeleteUserRequest>;

    beforeEach(() => {
      mockRequest = {
        params: {
          id: '123',
        },
      };
    });

    it('should return 400 if id is missing', async () => {
      mockRequest.params = { id: '' };

      await handleDeleteUser(
        mockRequest as DeleteUserRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User ID is required',
      });
    });

    it('should return 404 if user is not found', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(false);

      await handleDeleteUser(
        mockRequest as DeleteUserRequest,
        mockResponse as Response
      );

      expect(userService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 200 on successful deletion', async () => {
      (userService.deleteUser as jest.Mock).mockResolvedValue(true);

      await handleDeleteUser(
        mockRequest as DeleteUserRequest,
        mockResponse as Response
      );

      expect(userService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 500 if an error occurs', async () => {
      (userService.deleteUser as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleDeleteUser(
        mockRequest as DeleteUserRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleSearchUsers', () => {
    let mockRequest: Partial<SearchUsersRequest>;

    beforeEach(() => {
      mockRequest = {
        query: {
          searchTerm: 'test',
          limit: '10',
          offset: '0',
        },
      };
    });

    it('should return 400 if searchTerm is missing', async () => {
      mockRequest.query = { searchTerm: '' };

      await handleSearchUsers(
        mockRequest as SearchUsersRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Search term is required',
      });
    });

    it('should search users with default pagination if not provided', async () => {
      mockRequest.query = { searchTerm: 'test' };
      const mockUsers = [
        { id: '123', name: 'Test User', email: 'test@example.com' },
      ];

      (userService.searchUsers as jest.Mock).mockResolvedValue(mockUsers);

      await handleSearchUsers(
        mockRequest as SearchUsersRequest,
        mockResponse as Response
      );

      expect(userService.searchUsers).toHaveBeenCalledWith('test', 10, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        users: mockUsers,
        pagination: {
          limit: 10,
          offset: 0,
          count: 1,
        },
      });
    });

    it('should search users with provided pagination parameters', async () => {
      const mockUsers = [
        { id: '123', name: 'Test User', email: 'test@example.com' },
        { id: '456', name: 'Another Test', email: 'another@example.com' },
      ];

      (userService.searchUsers as jest.Mock).mockResolvedValue(mockUsers);

      await handleSearchUsers(
        mockRequest as SearchUsersRequest,
        mockResponse as Response
      );

      expect(userService.searchUsers).toHaveBeenCalledWith('test', 10, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        users: mockUsers,
        pagination: {
          limit: 10,
          offset: 0,
          count: 2,
        },
      });
    });

    it('should return 500 if an error occurs', async () => {
      (userService.searchUsers as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await handleSearchUsers(
        mockRequest as SearchUsersRequest,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });
});
