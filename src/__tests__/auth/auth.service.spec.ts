// src/__tests__/auth.service.spec.ts

import { login } from '../../services/auth.service';
import { UserModel } from '../../models/user.model';

// Mock the user model
jest.mock('../../models/user.model', () => ({
  UserModel: {
    findOne: jest.fn(),
  },
}));

describe('Auth - login function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token and user data if credentials are correct', async () => {
    // Create a mock user with the validatePassword method
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      validatePassword: jest.fn().mockResolvedValue(true),
    };

    // Set up the mock to return our user
    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await login('john@example.com', 'correct');
    expect(result?.user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    // Verify the token exists
    expect(result?.token).toBeDefined();
    expect(typeof result?.token).toBe('string');

    // Verify the password was validated
    expect(mockUser.validatePassword).toHaveBeenCalledWith('correct');
  });

  it('should return null if user is not found', async () => {
    // Mock no user found
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    const result = await login('wrong@example.com', 'password');
    expect(result).toBeNull();
  });

  it('should return null if password is incorrect', async () => {
    // Create a mock user with validatePassword returning false
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      validatePassword: jest.fn().mockResolvedValue(false),
    };

    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await login('john@example.com', 'wrong');
    expect(result).toBeNull();
    expect(mockUser.validatePassword).toHaveBeenCalledWith('wrong');
  });
});
