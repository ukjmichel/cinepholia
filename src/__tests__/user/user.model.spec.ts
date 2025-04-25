// src/models/__tests__/user.model.test.ts
import { UserModel } from '../../models/user.model';
import { Sequelize } from 'sequelize-typescript';
import bcrypt from 'bcrypt';

// Mock bcrypt to avoid actual hashing during tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest
    .fn()
    .mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
}));

describe('UserModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    // Use MySQL database that's already set up in your Docker environment
    // instead of SQLite which requires additional installation
    sequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST, // Docker service name
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // adjust according to your docker-compose
      database: process.env.DB_NAME, // adjust according to your docker-compose
      logging: false,
      models: [UserModel],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await UserModel.destroy({ where: {}, truncate: true, cascade: true });
    jest.clearAllMocks();
  });

  it('should create a user with valid attributes', async () => {
    const userData = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await UserModel.create(userData);

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    // Verify password was hashed
    expect(user.password).toBe(`hashed_${userData.password}`);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
  });

  it('should fail with invalid name format', async () => {
    const userData = {
      name: 'test user', // Contains a space, violates regex
      email: 'test@example.com',
      password: 'password123',
    };

    await expect(UserModel.create(userData)).rejects.toThrow();
  });

  it('should fail with name too short', async () => {
    const userData = {
      name: 'a', // Too short
      email: 'test@example.com',
      password: 'password123',
    };

    await expect(UserModel.create(userData)).rejects.toThrow();
  });

  it('should fail with invalid email format', async () => {
    const userData = {
      name: 'testuser',
      email: 'invalid-email', // Not a valid email
      password: 'password123',
    };

    await expect(UserModel.create(userData)).rejects.toThrow();
  });

  it('should enforce unique email constraint', async () => {
    const userData1 = {
      name: 'user1',
      email: 'duplicate@example.com',
      password: 'password123',
    };

    const userData2 = {
      name: 'user2',
      email: 'duplicate@example.com', // Same email
      password: 'password456',
    };

    await UserModel.create(userData1);
    await expect(UserModel.create(userData2)).rejects.toThrow();
  });

  it('should enforce unique name constraint', async () => {
    const userData1 = {
      name: 'duplicatename',
      email: 'user1@example.com',
      password: 'password123',
    };

    const userData2 = {
      name: 'duplicatename', // Same name
      email: 'user2@example.com',
      password: 'password456',
    };

    await UserModel.create(userData1);
    await expect(UserModel.create(userData2)).rejects.toThrow();
  });

  it('should correctly validate a password', async () => {
    const userData = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await UserModel.create(userData);

    // Mock bcrypt.compare to return true for correct password
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    const validResult = await user.validatePassword('password123');
    expect(validResult).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);

    // Mock bcrypt.compare to return false for incorrect password
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    const invalidResult = await user.validatePassword('wrongpassword');
    expect(invalidResult).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', user.password);
  });

  it('should update password with hash when updating a user', async () => {
    // Create initial user
    const user = await UserModel.create({
      name: 'testuser',
      email: 'test@example.com',
      password: 'initialpassword',
    });

    expect(user.password).toBe('hashed_initialpassword');

    // Clear the mock calls
    jest.clearAllMocks();

    // Update the password
    user.password = 'newpassword';
    await user.save();

    // Verify the password was hashed again
    expect(user.password).toBe('hashed_newpassword');
    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 'salt');
  });

  it('should not hash password when other fields are updated', async () => {
    // Create initial user
    const user = await UserModel.create({
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // Clear the mock calls
    jest.clearAllMocks();

    // Update the name only
    user.name = 'updatedname';
    await user.save();

    // Verify the password was not hashed again
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });
});
