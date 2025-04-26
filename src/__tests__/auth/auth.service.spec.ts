// src/__tests__/auth/auth.service.spec.ts
import jwt from 'jsonwebtoken';
import {AuthService} from '../../services/auth.service';
import { UserInterface } from '../../interfaces/user.interface';

// Mock the UserModel and jwt
jest.mock('../../models/user.model', () => ({
  UserModel: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake.jwt.token'),
  verify: jest.fn(),
}));

describe('Auth Service', () => {
  let authService: AuthService;
  const testSecret = 'test_secret';
  const testExpiration = 7200; // 2 hours in seconds

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(testSecret, testExpiration);
  });

  describe('generateToken', () => {
    it('should generate a token with correct payload and options', () => {
      // Mock user data
      const user: UserInterface = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      // Call the method
      const token = authService.generateToken(user);

      // Check the result
      expect(token).toBe('fake.jwt.token');

      // Check that jwt.sign was called with the right parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
        testSecret,
        { expiresIn: testExpiration }
      );
    });
  });

  describe('verifyToken', () => {
    it('should return payload when token is valid', () => {
      const mockPayload = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Setup mock for jwt.verify
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = authService.verifyToken('valid.token');

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('valid.token', testSecret);
    });

    it('should return null when token verification fails', () => {
      // Setup mock for jwt.verify to throw error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyToken('invalid.token');

      expect(result).toBeNull();
      expect(jwt.verify).toHaveBeenCalledWith('invalid.token', testSecret);
    });
  });

  describe('login', () => {
    it('should return null when user is not found', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock UserModel.findOne to return null
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.login(
        'nonexistent@example.com',
        'password123'
      );

      expect(result).toBeNull();
      expect(UserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should return null when password is invalid', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock user with validatePassword method
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login(
        'test@example.com',
        'wrong_password'
      );

      expect(result).toBeNull();
      expect(mockUser.validatePassword).toHaveBeenCalledWith('wrong_password');
    });

    it('should return token and user data when credentials are valid', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock user with validatePassword method
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Spy on generateToken method
      jest
        .spyOn(authService, 'generateToken')
        .mockReturnValue('fake.jwt.token');

      const result = await authService.login(
        'test@example.com',
        'correct_password'
      );

      expect(result).toEqual({
        token: 'fake.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      expect(mockUser.validatePassword).toHaveBeenCalledWith(
        'correct_password'
      );
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('should return null when user is not found', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock UserModel.findByPk to return null
      (UserModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await authService.refreshToken('nonexistent');

      expect(result).toBeNull();
      expect(UserModel.findByPk).toHaveBeenCalledWith('nonexistent');
    });

    it('should return new token and user data when user exists', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock user
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      (UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      // Spy on generateToken method
      jest.spyOn(authService, 'generateToken').mockReturnValue('new.jwt.token');

      const result = await authService.refreshToken('123');

      expect(result).toEqual({
        token: 'new.jwt.token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      expect(UserModel.findByPk).toHaveBeenCalledWith('123');
      expect(authService.generateToken).toHaveBeenCalledWith(mockUser);
    });
  });
});
