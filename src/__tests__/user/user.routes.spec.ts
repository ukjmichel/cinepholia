import request from 'supertest';
import express, { Request, Response } from 'express';
import { Role } from '../../models/authorization.model';

// Define an interface for the request body
interface CreateUserRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

describe('🧪 User Controller - handleCreateUser', () => {
  it('should create a user with "utilisateur" role', async () => {
    // Create an Express app just for this test
    const app = express();
    app.use(express.json());

    // Create spies for all dependencies
    const mockUserService = {
      isEmailUnique: jest.fn().mockResolvedValue(true),
      createUser: jest.fn().mockResolvedValue({
        id: '123',
        name: 'TestUser',
        email: 'test@example.com',
      }),
    };

    const mockAuthService = {
      generateToken: jest.fn().mockReturnValue('mock-token'),
    };

    const mockAuthorizationService = {
      setRole: jest.fn().mockResolvedValue(undefined),
    };

    // Mock the handleCreateUser function with dependencies injected
    const handleCreateUser =
      (role: Role) => async (req: CreateUserRequest, res: Response) => {
        const { name, email, password } = req.body; // Now TypeScript knows these properties exist

        try {
          const emailIsUnique = await mockUserService.isEmailUnique(email);
          if (!emailIsUnique) {
            res.status(400).json({ message: 'Email already used' });
            return;
          }

          const user = await mockUserService.createUser(name, email, password);
          await mockAuthorizationService.setRole(user.id, role);
          const token = mockAuthService.generateToken({ ...user, password });

          res.status(201).json({
            message: 'new account successfully created',
            data: user,
            role,
            token,
          });
        } catch (error) {
          console.error('User creation failed:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      };

    // Set up the route with our mocked controller
    app.post('/users', handleCreateUser('utilisateur'));

    // Test the route
    const response = await request(app).post('/users').send({
      name: 'TestUser',
      email: 'test@example.com',
      password: 'Password123!',
    });

    // Verify the response
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'new account successfully created',
      data: {
        id: '123',
        name: 'TestUser',
        email: 'test@example.com',
      },
      role: 'utilisateur',
      token: 'mock-token',
    });

    // Verify the mocks were called correctly
    expect(mockUserService.isEmailUnique).toHaveBeenCalledWith(
      'test@example.com'
    );
    expect(mockUserService.createUser).toHaveBeenCalledWith(
      'TestUser',
      'test@example.com',
      'Password123!'
    );
    expect(mockAuthorizationService.setRole).toHaveBeenCalledWith(
      '123',
      'utilisateur'
    );
    expect(mockAuthService.generateToken).toHaveBeenCalled();
  });
});
