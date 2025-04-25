// src/__tests__/user/user.service.spec.ts
import { isEmailUnique, createUser } from '../../services/user.service';

// Mock the UserModel directly without importing it
jest.mock('../../models/user.model', () => ({
  UserModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isEmailUnique', () => {
    it('should return true if email is unique', async () => {
      // Access the mocked module
      const { UserModel } = require('../../models/user.model');

      // Mock UserModel.findOne to return null (no user found)
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await isEmailUnique('unique@example.com');

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

      const result = await isEmailUnique('exists@example.com');

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

      const result = await createUser(
        'Test User',
        'test@example.com',
        'password123'
      );

      // Vérifier que le résultat n'inclut pas le mot de passe
      expect(result).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        // password ne devrait pas être présent
      });

      // Vérifier l'absence du mot de passe
      expect(result).not.toHaveProperty('password');

      // Vérifier que la création a été appelée avec les bons paramètres
      expect(UserModel.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // Mot de passe non haché, car le hachage est géré par le hook
      });
    });
  });
});
