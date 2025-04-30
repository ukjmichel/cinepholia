// src/__tests__/routes/booking.routes.spec.ts

// Import types first
import { Request, Response, NextFunction } from 'express';
import express from 'express';
import request from 'supertest';

// Mock controllers first
jest.mock('../../controllers/booking.controller', () => ({
  handleCreateBooking: jest.fn((req, res) =>
    res.status(201).json({ message: 'Booking created' })
  ),
  handleGetBookingById: jest.fn((req, res) =>
    res.status(200).json({ message: 'Booking found' })
  ),
  handleGetAllBookings: jest.fn((req, res) =>
    res.status(200).json({ message: 'Bookings list' })
  ),
  handleUpdateBooking: jest.fn((req, res) =>
    res.status(200).json({ message: 'Booking updated' })
  ),
  handleDeleteBooking: jest.fn((req, res) => res.status(204).send()),
  handleMarkBookingAsUsed: jest.fn((req, res) =>
    res.status(200).json({ message: 'Booking marked as used' })
  ),
  handleCancelBooking: jest.fn((req, res) =>
    res.status(200).json({ message: 'Booking canceled' })
  ),
  handleGetBookingsByUser: jest.fn((req, res) =>
    res.status(200).json({ message: 'Bookings by user' })
  ),
}));

// Mock auth middleware - using type assertion to avoid TypeScript errors
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: jest.fn((_req: any, _res: any, next: any) => {
    // We're using any type to bypass TypeScript's property checking
    // This allows the test to run while avoiding conflicts with your application's types
    _req.user = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    };
    next();
  }),
}));

// Mock all authorization middleware functions
jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: jest.fn(() =>
      jest.fn((_req: any, _res: any, next: any) => next())
    ),
    isNotStaff: jest.fn(() =>
      jest.fn((_req: any, _res: any, next: any) => next())
    ),
    isBookingOwnerOrStaff: jest.fn(() =>
      jest.fn((_req: any, _res: any, next: any) => next())
    ),
    selfOrStaff: jest.fn(() =>
      jest.fn((_req: any, _res: any, next: any) => next())
    ),
  },
}));

// Import routing after mocks
const bookingRouter = require('../../routes/booking.routes').default;

describe('Booking Routes', () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/bookings', bookingRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /bookings', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/bookings');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Bookings list' });
    });
  });

  describe('GET /bookings/:bookingId', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/bookings/booking123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Booking found' });
    });
  });

  describe('PUT /bookings/:bookingId', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).put('/bookings/booking123').send({
        status: 'used',
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Booking updated' });
    });
  });

  describe('DELETE /bookings/:bookingId', () => {
    it('should return 204 No Content', async () => {
      const response = await request(app).delete('/bookings/booking123');
      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /bookings/:bookingId/used', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).patch('/bookings/booking123/used');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Booking marked as used' });
    });
  });

  describe('PATCH /bookings/:bookingId/cancel', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).patch('/bookings/booking123/cancel');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Booking canceled' });
    });
  });

  describe('GET /bookings/user/:userId', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/bookings/user/user123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Bookings by user' });
    });
  });

  // Test to verify the route order works correctly
  describe('Route order', () => {
    it('should correctly route to different endpoints', async () => {
      // Test user route
      const userResponse = await request(app).get('/bookings/user/user123');
      expect(userResponse.status).toBe(200);
      expect(userResponse.body).toEqual({ message: 'Bookings by user' });

      // Test booking route
      const bookingResponse = await request(app).get('/bookings/booking123');
      expect(bookingResponse.status).toBe(200);
      expect(bookingResponse.body).toEqual({ message: 'Booking found' });
    });
  });
});
