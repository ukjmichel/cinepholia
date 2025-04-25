// src/__tests__/user/user.service.spec.ts
import UserService from '../../services/user.service';
import { Op } from 'sequelize';

// Mock the UserModel directly without importing it
jest.mock('../../models/user.model', () => ({
  UserModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAll: jest.fn(),
  },
}));

describe('User Service', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe('isEmailUnique', () => {
    it('should return true if email is unique', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock UserModel.findOne to return null (no user found)
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.isEmailUnique('unique@example.com');

      expect(result).toBe(true);
      expect(UserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'unique@example.com' },
      });
    });

    it('should return false if email already exists', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock UserModel.findOne to return a user
      (UserModel.findOne as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'exists@example.com',
      });

      const result = await userService.isEmailUnique('exists@example.com');

      expect(result).toBe(false);
      expect(UserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'exists@example.com' },
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user with provided information and exclude password in response', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      const newUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        get: jest.fn().mockReturnValue({
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
        }),
      };

      (UserModel.create as jest.Mock).mockResolvedValue(newUser);

      const result = await userService.createUser(
        'Test User',
        'test@example.com',
        'password123'
      );

      // Verify result doesn't include password
      expect(result).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      });

      // Verify password absence
      expect(result).not.toHaveProperty('password');

      // Verify creation was called with correct parameters
      expect(UserModel.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // Password hashing is handled by model hook
      });
    });
  });

  describe('getUserById', () => {
    it('should return user data without password when user exists', async () => {
      const { UserModel } = require('../../models/user.model');

      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        get: jest.fn().mockReturnValue({
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
        }),
      };

      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');

      expect(result).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(result).not.toHaveProperty('password');
      expect(UserModel.findByPk).toHaveBeenCalledWith('123');
    });

    it('should return null when user does not exist', async () => {
      const { UserModel } = require('../../models/user.model');

      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('nonexistent');

      expect(result).toBeNull();
      expect(UserModel.findByPk).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated data without password', async () => {
      const { UserModel } = require('../../models/user.model');

      // Mock the update method to return count of updated rows
      (UserModel.update as jest.Mock).mockResolvedValue([1]);

      // Mock getUserById to return updated user
      jest.spyOn(userService, 'getUserById').mockResolvedValue({
        id: '123',
        name: 'Updated Name',
        email: 'test@example.com',
      });

      const updateData = {
        name: 'Updated Name',
        password: 'shouldnotbeused', // This should be filtered out
      };

      const result = await userService.updateUser('123', updateData);

      expect(result).toEqual({
        id: '123',
        name: 'Updated Name',
        email: 'test@example.com',
      });

      expect(UserModel.update).toHaveBeenCalledWith(
        { name: 'Updated Name' }, // Verify password is excluded
        { where: { id: '123' } }
      );

      expect(userService.getUserById).toHaveBeenCalledWith('123');
    });

    it('should return null when user does not exist', async () => {
      const { UserModel } = require('../../models/user.model');

      // Mock update to return 0 updated rows
      (UserModel.update as jest.Mock).mockResolvedValue([0]);

      const result = await userService.updateUser('nonexistent', {
        name: 'New Name',
      });

      expect(result).toBeNull();
      expect(UserModel.update).toHaveBeenCalledWith(
        { name: 'New Name' },
        { where: { id: 'nonexistent' } }
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully when credentials are valid', async () => {
      const { UserModel } = require('../../models/user.model');

      const mockUser = {
        id: '123',
        password: 'currentHashedPassword',
        validatePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.changePassword(
        '123',
        'currentPassword',
        'newPassword'
      );

      expect(result).toBe(true);
      expect(UserModel.findByPk).toHaveBeenCalledWith('123');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('currentPassword');
      expect(mockUser.password).toBe('newPassword');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return false when user does not exist', async () => {
      const { UserModel } = require('../../models/user.model');

      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await userService.changePassword(
        'nonexistent',
        'currentPassword',
        'newPassword'
      );

      expect(result).toBe(false);
      expect(UserModel.findByPk).toHaveBeenCalledWith('nonexistent');
    });

    it('should return false when current password is invalid', async () => {
      const { UserModel } = require('../../models/user.model');

      const mockUser = {
        id: '123',
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.changePassword(
        '123',
        'wrongPassword',
        'newPassword'
      );

      expect(result).toBe(false);
      expect(mockUser.validatePassword).toHaveBeenCalledWith('wrongPassword');
    });
  });

  describe('deleteUser', () => {
    it('should return true when user is successfully deleted', async () => {
      const { UserModel } = require('../../models/user.model');

      (UserModel.destroy as jest.Mock).mockResolvedValue(1);

      const result = await userService.deleteUser('123');

      expect(result).toBe(true);
      expect(UserModel.destroy).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return false when user does not exist', async () => {
      const { UserModel } = require('../../models/user.model');

      (UserModel.destroy as jest.Mock).mockResolvedValue(0);

      const result = await userService.deleteUser('nonexistent');

      expect(result).toBe(false);
      expect(UserModel.destroy).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });
  });

  describe('searchUsers', () => {
    it('should return users matching search criteria without passwords', async () => {
      const { UserModel } = require('../../models/user.model');

      const mockUsers = [
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
          get: jest.fn().mockReturnValue({
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedpassword',
          }),
        },
        {
          id: '456',
          name: 'Another Test',
          email: 'another@example.com',
          password: 'hashedpassword2',
          get: jest.fn().mockReturnValue({
            id: '456',
            name: 'Another Test',
            email: 'another@example.com',
            password: 'hashedpassword2',
          }),
        },
      ];

      (UserModel.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.searchUsers('test', 10, 0);

      expect(result).toEqual([
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
        {
          id: '456',
          name: 'Another Test',
          email: 'another@example.com',
        },
      ]);

      expect(UserModel.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%test%' } },
            { email: { [Op.like]: '%test%' } },
          ],
        },
        limit: 10,
        offset: 0,
        attributes: { exclude: ['password'] },
      });

      // Verify passwords are excluded
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should return empty array when no users match criteria', async () => {
      const { UserModel } = require('../../models/user.model');

      (UserModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await userService.searchUsers('nonexistent');

      expect(result).toEqual([]);
      expect(UserModel.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%nonexistent%' } },
            { email: { [Op.like]: '%nonexistent%' } },
          ],
        },
        limit: 10,
        offset: 0,
        attributes: { exclude: ['password'] },
      });
    });
  });
});
