import request from 'supertest';
import express, { Request, Response } from 'express';
import { Role } from '../../models/authorization.model';
import { BadRequestError } from '../../errors/BadRequestError';

// Define an interface for the request body
interface CreateUserRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

describe('🧪 User Controller - handleCreateUser (isolated)', () => {
  let app: express.Application;
  let mockUserService: any;
  let mockAuthService: any;
  let mockAuthorizationService: any;
  let mockEmailService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Create fresh mocks before each test
    mockUserService = {
      createUser: jest.fn(),
    };
    mockAuthService = {
      generateToken: jest.fn(),
    };
    mockAuthorizationService = {
      setRole: jest.fn(),
    };
    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    };
  });

  // Mock handleCreateUser function inside test
  const createHandleCreateUser =
    (role: Role) => async (req: CreateUserRequest, res: Response) => {
      const { username, email, password } = req.body;

      try {
        const user = await mockUserService.createUser(
          username,
          email,
          password
        );
        await mockAuthorizationService.setRole(user.id, role);
        const token = mockAuthService.generateToken({ ...user, password });
        await mockEmailService.sendWelcomeEmail(email, username);

        res.status(201).json({
          message: 'New account successfully created',
          data: user,
          role,
          token,
        });
      } catch (error) {
        if (error instanceof BadRequestError) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('User creation failed:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    };

  it('should create a user with "utilisateur" role successfully', async () => {
    mockUserService.createUser.mockResolvedValue({
      id: '123',
      username: 'TestUser',
      email: 'test@example.com',
    });
    mockAuthService.generateToken.mockReturnValue('mock-token');
    mockAuthorizationService.setRole.mockResolvedValue(undefined);
    mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

    app.post('/users', createHandleCreateUser('utilisateur'));

    const response = await request(app).post('/users').send({
      username: 'TestUser',
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'New account successfully created',
      data: {
        id: '123',
        username: 'TestUser',
        email: 'test@example.com',
      },
      role: 'utilisateur',
      token: 'mock-token',
    });

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
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'test@example.com',
      'TestUser'
    );
  });

  it('should return 400 if email already registered (BadRequestError)', async () => {
    mockUserService.createUser.mockRejectedValue(
      new BadRequestError('Email is already registered.')
    );

    app.post('/users', createHandleCreateUser('utilisateur'));

    const response = await request(app).post('/users').send({
      username: 'DuplicateUser',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Email is already registered.',
    });
  });

  it('should return 500 if unexpected error occurs', async () => {
    mockUserService.createUser.mockRejectedValue(
      new Error('Unexpected server error')
    );

    app.post('/users', createHandleCreateUser('utilisateur'));

    const response = await request(app).post('/users').send({
      username: 'ServerErrorUser',
      email: 'error@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Internal server error',
    });
  });
});
