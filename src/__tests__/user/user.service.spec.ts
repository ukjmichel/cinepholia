// src/__tests__/user/user.service.spec.ts
import UserService from '../../services/user.service';
import { NotFoundError } from '../../errors/NotFoundError';
import { BadRequestError } from '../../errors/BadRequestError';
import { Op } from 'sequelize';

// Mock the UserModel
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

  describe('createUser', () => {
    it('should create a user when email is unique', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const newUser = {
        get: jest.fn().mockReturnValue({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedpassword',
        }),
      };
      (UserModel.create as jest.Mock).mockResolvedValue(newUser);

      const result = await userService.createUser(
        'John Doe',
        'john@example.com',
        'password'
      );

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(UserModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestError if email already exists', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findOne as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(
        userService.createUser('John', 'john@example.com', 'password')
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      const { UserModel } = require('../../models/user.model');
      const userMock = {
        get: jest.fn().mockReturnValue({
          id: '1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'hashed',
        }),
      };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(userMock);

      const result = await userService.getUserById('1');

      expect(result).toEqual({
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('999')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user without password', async () => {
      const { UserModel } = require('../../models/user.model');
      const userMock = {
        get: jest.fn().mockReturnValue({
          id: '1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'hashed',
        }),
      };
      (UserModel.findOne as jest.Mock).mockResolvedValue(userMock);

      const result = await userService.getUserByEmail('jane@example.com');

      expect(result).toEqual({
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.getUserByEmail('missing@example.com')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated data', async () => {
      const { UserModel } = require('../../models/user.model');
      const userMock = {
        update: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockReturnValue({
          id: '1',
          name: 'Updated Name',
          email: 'updated@example.com',
          password: 'hashed',
        }),
      };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(userMock);

      const result = await userService.updateUser('1', {
        name: 'Updated Name',
      });

      expect(result).toEqual({
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
      });
    });

    it('should throw NotFoundError if user not found', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.updateUser('999', { name: 'Name' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is valid', async () => {
      const { UserModel } = require('../../models/user.model');
      const userMock = {
        validatePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(userMock);

      await expect(
        userService.changePassword('1', 'currentPass', 'newPass')
      ).resolves.toBeUndefined();
      expect(userMock.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user not found', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.changePassword('999', 'current', 'new')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if current password is invalid', async () => {
      const { UserModel } = require('../../models/user.model');
      const userMock = {
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      (UserModel.findByPk as jest.Mock).mockResolvedValue(userMock);

      await expect(
        userService.changePassword('1', 'wrong', 'new')
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.destroy as jest.Mock).mockResolvedValue(1);

      await expect(userService.deleteUser('1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundError if user not found', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.destroy as jest.Mock).mockResolvedValue(0);

      await expect(userService.deleteUser('999')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('searchUsers', () => {
    it('should return matching users without passwords', async () => {
      const { UserModel } = require('../../models/user.model');
      const usersMock = [
        {
          get: jest.fn().mockReturnValue({
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            // password: 'hashed',  <-- REMOVE this to simulate the real database behavior
          }),
        },
      ];
      (UserModel.findAll as jest.Mock).mockResolvedValue(usersMock);

      const result = await userService.searchUsers('test');

      expect(result).toEqual([
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
      ]);
    });

    it('should return empty array if no matches', async () => {
      const { UserModel } = require('../../models/user.model');
      (UserModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await userService.searchUsers('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
