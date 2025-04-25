// src/__tests__/user/user.routes.spec.ts
import request from 'supertest';
import express from 'express';
import userRouter from '../../routes/user.routes';
import * as userController from '../../controllers/user.controller';

// Mock the controller functions
jest.mock('../../controllers/user.controller', () => ({
  handleCreateUser: jest.fn((req, res) =>
    res.status(201).json({ message: 'Mock create user' })
  ),
  handleGetUser: jest.fn((req, res) =>
    res.status(200).json({ id: req.params.id, name: 'Test User' })
  ),
  handleUpdateUser: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mock update user' })
  ),
  handleChangePassword: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mock change password' })
  ),
  handleDeleteUser: jest.fn((req, res) =>
    res.status(200).json({ message: 'Mock delete user' })
  ),
  handleSearchUsers: jest.fn((req, res) =>
    res.status(200).json({ users: [], message: 'Mock search users' })
  ),
}));

describe('User Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', userRouter);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should route to handleCreateUser controller', async () => {
      const response = await request(app).post('/users').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(userController.handleCreateUser).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Mock create user' });
    });
  });

  describe('GET /users/:id', () => {
    it('should route to handleGetUser controller', async () => {
      const response = await request(app).get('/users/123');

      expect(response.status).toBe(200);
      expect(userController.handleGetUser).toHaveBeenCalled();
      expect(response.body).toEqual({ id: '123', name: 'Test User' });
    });
  });

  describe('PUT /users/:id', () => {
    it('should route to handleUpdateUser controller', async () => {
      const response = await request(app).put('/users/123').send({
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      expect(response.status).toBe(200);
      expect(userController.handleUpdateUser).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Mock update user' });
    });
  });

  describe('PUT /users/:id/password', () => {
    it('should route to handleChangePassword controller', async () => {
      const response = await request(app).put('/users/123/password').send({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
      });

      expect(response.status).toBe(200);
      expect(userController.handleChangePassword).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Mock change password' });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should route to handleDeleteUser controller', async () => {
      const response = await request(app).delete('/users/123');

      expect(response.status).toBe(200);
      expect(userController.handleDeleteUser).toHaveBeenCalled();
      expect(response.body).toEqual({ message: 'Mock delete user' });
    });
  });

  describe('GET /users/search', () => {
    it('should route to handleSearchUsers controller', async () => {
      const response = await request(app).get('/users/search?searchTerm=test');

      expect(response.status).toBe(200);
      expect(userController.handleSearchUsers).toHaveBeenCalled();
      expect(response.body).toEqual({
        users: [],
        message: 'Mock search users',
      });
    });

    // Test that search works with pagination parameters
    it('should route to handleSearchUsers with pagination parameters', async () => {
      const response = await request(app).get(
        '/users/search?searchTerm=test&limit=5&offset=10'
      );

      expect(response.status).toBe(200);
      expect(userController.handleSearchUsers).toHaveBeenCalled();

      // Check if the query parameters are passed correctly
      const req = (userController.handleSearchUsers as jest.Mock).mock
        .calls[0][0];
      expect(req.query.searchTerm).toBe('test');
      expect(req.query.limit).toBe('5');
      expect(req.query.offset).toBe('10');
    });
  });

  // Test route precedence
  describe('Route Precedence', () => {
    it('should route to search and not interpret "search" as an ID', async () => {
      // First access the search endpoint
      await request(app).get('/users/search?searchTerm=test');

      // Check that the search handler was called
      expect(userController.handleSearchUsers).toHaveBeenCalled();
      expect(userController.handleGetUser).not.toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();

      // Now try a normal ID request to confirm it goes to the right handler
      await request(app).get('/users/123');

      expect(userController.handleGetUser).toHaveBeenCalled();
      expect(userController.handleSearchUsers).not.toHaveBeenCalled();
    });
  });
});
