// src/__tests__/booking/booking.controller.spec.ts

import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';
import {
  handleCreateBooking,
  handleGetBookingById,
  handleGetAllBookings,
  handleUpdateBooking,
  handleDeleteBooking,
  handleMarkBookingAsUsed,
  handleCancelBooking,
  handleGetBookingsByUser,
} from '../../controllers/booking.controller';
import { BookingService } from '../../services/booking.service';
import { BookingAttributes } from '../../models/booking.model';

// Define UserPayload interface to match what's expected in your application
interface UserPayload {
  id: string;
  name: string;
  email: string;
}

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Custom type for when we know user will be defined
type AuthenticatedRequest = Request & { user: UserPayload };

// Mock BookingService for more precise testing
jest.mock('../../services/booking.service', () => {
  const mockCreateBooking = jest.fn<Promise<any>, [BookingAttributes]>();
  const mockGetBookingById = jest.fn<
    Promise<BookingAttributes | null>,
    [string]
  >();
  const mockGetAllBookings = jest.fn<Promise<BookingAttributes[]>, []>();
  const mockUpdateBooking = jest.fn<
    Promise<BookingAttributes | null>,
    [string, Partial<BookingAttributes>]
  >();
  const mockDeleteBooking = jest.fn<Promise<boolean>, [string]>();
  const mockGetBookingsByUserId = jest.fn<
    Promise<BookingAttributes[]>,
    [string]
  >();
  const mockMarkBookingAsUsed = jest.fn<
    Promise<BookingAttributes | null>,
    [string]
  >();
  const mockCancelBooking = jest.fn<
    Promise<BookingAttributes | null>,
    [string]
  >();

  return {
    BookingService: jest.fn().mockImplementation(() => ({
      createBooking: mockCreateBooking,
      getBookingById: mockGetBookingById,
      getAllBookings: mockGetAllBookings,
      updateBooking: mockUpdateBooking,
      deleteBooking: mockDeleteBooking,
      getBookingsByUserId: mockGetBookingsByUserId,
      markBookingAsUsed: mockMarkBookingAsUsed,
      cancelBooking: mockCancelBooking,
    })),
    // Export mocks for easier access in tests
    __mocks: {
      createBooking: mockCreateBooking,
      getBookingById: mockGetBookingById,
      getAllBookings: mockGetAllBookings,
      updateBooking: mockUpdateBooking,
      deleteBooking: mockDeleteBooking,
      getBookingsByUserId: mockGetBookingsByUserId,
      markBookingAsUsed: mockMarkBookingAsUsed,
      cancelBooking: mockCancelBooking,
    },
  };
});

// Get mocks
const mocks = require('../../services/booking.service').__mocks;

// 🧩 Mock authenticateJwt middleware so req.user is injected during tests
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: Request, res: Response, next: NextFunction) => {
    // Use type assertion to set the user with all required properties
    req.user = {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    next();
  },
}));

describe('BookingController', () => {
  let app: Express;
  let sequelize: Sequelize;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    // Setup in-memory SQLite database
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    sequelize.addModels([
      BookingModel,
      UserModel,
      ScreeningModel,
      MovieModel,
      MovieTheaterModel,
      MovieHallModel,
    ]);

    await sequelize.sync({ force: true });

    // Apply middleware to simulate auth for all routes
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.user = {
        id: 'user-uuid',
        name: 'Test User',
        email: 'test@example.com',
      };
      next();
    });

    // Routes for testing
    app.post('/bookings', handleCreateBooking);
    app.get('/bookings', handleGetAllBookings);
    app.get('/bookings/:bookingId', handleGetBookingById);
    app.put('/bookings/:bookingId', handleUpdateBooking);
    app.delete('/bookings/:bookingId', handleDeleteBooking);
    app.patch('/bookings/:bookingId/used', handleMarkBookingAsUsed);
    app.patch('/bookings/:bookingId/cancel', handleCancelBooking);
    app.get('/bookings/user/:userId', handleGetBookingsByUser);
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default implementations for mocks
    mocks.createBooking.mockImplementation(
      async (bookingData: BookingAttributes) => ({ ...bookingData })
    );
    mocks.getBookingById.mockImplementation(async (id: string) => {
      if (id === 'invalid-id') return null;
      return {
        bookingId: id,
        userId: 'user-uuid',
        screeningId: 'screening-123',
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'pending',
      } as BookingAttributes;
    });
    mocks.getAllBookings.mockResolvedValue([
      {
        bookingId: 'booking-1',
        userId: 'user-uuid',
        screeningId: 'screening-123',
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'pending',
      } as BookingAttributes,
      {
        bookingId: 'booking-2',
        userId: 'user-uuid',
        screeningId: 'screening-456',
        bookingDate: new Date(),
        seatsNumber: 1,
        status: 'used',
      } as BookingAttributes,
    ]);
    mocks.updateBooking.mockImplementation(
      async (id: string, data: Partial<BookingAttributes>) => {
        if (id === 'invalid-id') return null;
        return {
          bookingId: id,
          userId: 'user-uuid',
          screeningId: 'screening-123',
          bookingDate: new Date(),
          seatsNumber: data.seatsNumber || 2,
          status: data.status || 'pending',
          ...data,
        } as BookingAttributes;
      }
    );
    mocks.deleteBooking.mockImplementation(async (id: string) => {
      return id !== 'invalid-id';
    });
    mocks.getBookingsByUserId.mockImplementation(async (userId: string) => {
      return [
        {
          bookingId: 'user-booking-1',
          userId,
          screeningId: 'screening-123',
          bookingDate: new Date(),
          seatsNumber: 2,
          status: 'pending',
        } as BookingAttributes,
        {
          bookingId: 'user-booking-2',
          userId,
          screeningId: 'screening-456',
          bookingDate: new Date(),
          seatsNumber: 3,
          status: 'pending',
        } as BookingAttributes,
      ];
    });
    mocks.markBookingAsUsed.mockImplementation(async (id: string) => {
      if (id === 'invalid-id') return null;
      return {
        bookingId: id,
        userId: 'user-uuid',
        screeningId: 'screening-123',
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'used',
      } as BookingAttributes;
    });
    mocks.cancelBooking.mockImplementation(async (id: string) => {
      if (id === 'invalid-id') return null;
      return {
        bookingId: id,
        userId: 'user-uuid',
        screeningId: 'screening-123',
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'canceled',
      } as BookingAttributes;
    });
  });

  describe('handleCreateBooking', () => {
    it('should create a booking and enforce userId from token', async () => {
      const bookingData = {
        bookingId: 'booking-uuid',
        userId: 'different-user-id', // This should be overridden by token's userId
        screeningId: 'screening-uuid',
        bookingDate: new Date().toISOString(),
        seatsNumber: 2,
        status: 'pending',
      };

      const response = await request(app).post('/bookings').send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId', 'user-uuid');
      expect(mocks.createBooking).toHaveBeenCalledWith({
        ...bookingData,
        userId: 'user-uuid', // Verify userId was overridden
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Create a separate app instance for this test without auth middleware
      const noAuthApp = express();
      noAuthApp.use(express.json());
      noAuthApp.post('/bookings', handleCreateBooking);

      const response = await request(noAuthApp).post('/bookings').send({
        bookingId: 'booking-uuid',
        screeningId: 'screening-uuid',
        bookingDate: new Date().toISOString(),
        seatsNumber: 2,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should handle service errors during booking creation', async () => {
      // Mock service to throw an error
      mocks.createBooking.mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/bookings').send({
        bookingId: 'booking-uuid',
        screeningId: 'screening-uuid',
        bookingDate: new Date().toISOString(),
        seatsNumber: 2,
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        'message',
        'Failed to create booking'
      );
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('handleGetBookingById', () => {
    it('should get a booking by ID', async () => {
      const response = await request(app).get('/bookings/booking-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookingId', 'booking-123');
      expect(mocks.getBookingById).toHaveBeenCalledWith('booking-123');
    });

    it('should return 404 if booking not found', async () => {
      const response = await request(app).get('/bookings/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('invalid-id');
      expect(response.body.message).toContain('not found');
    });

    it('should handle service errors when getting a booking', async () => {
      mocks.getBookingById.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app).get('/bookings/booking-123');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to fetch booking');
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('handleGetAllBookings', () => {
    it('should get all bookings', async () => {
      const response = await request(app).get('/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('bookingId', 'booking-1');
      expect(mocks.getAllBookings).toHaveBeenCalled();
    });

    it('should handle service errors when getting all bookings', async () => {
      mocks.getAllBookings.mockRejectedValue(new Error('Failed to fetch data'));

      const response = await request(app).get('/bookings');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to fetch bookings');
      expect(response.body.error).toBe('Failed to fetch data');
    });

    it('should return empty array when no bookings exist', async () => {
      mocks.getAllBookings.mockResolvedValue([]);

      const response = await request(app).get('/bookings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('handleUpdateBooking', () => {
    it('should update a booking', async () => {
      const updateData = { status: 'used', seatsNumber: 3 };

      const response = await request(app)
        .put('/bookings/booking-update')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookingId', 'booking-update');
      expect(response.body).toHaveProperty('status', 'used');
      expect(response.body).toHaveProperty('seatsNumber', 3);
      expect(mocks.updateBooking).toHaveBeenCalledWith(
        'booking-update',
        updateData
      );
    });

    it('should return 404 if booking to update not found', async () => {
      const response = await request(app)
        .put('/bookings/invalid-id')
        .send({ status: 'used' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('invalid-id');
    });

    it('should handle service errors during booking update', async () => {
      mocks.updateBooking.mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put('/bookings/booking-update')
        .send({ status: 'used' });

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to update booking');
      expect(response.body.error).toBe('Update failed');
    });
  });

  describe('handleDeleteBooking', () => {
    it('should delete a booking', async () => {
      const response = await request(app).delete('/bookings/booking-delete');

      expect(response.status).toBe(204);
      expect(mocks.deleteBooking).toHaveBeenCalledWith('booking-delete');
    });

    it('should return 404 if booking to delete not found', async () => {
      const response = await request(app).delete('/bookings/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('invalid-id');
    });

    it('should handle service errors during booking deletion', async () => {
      mocks.deleteBooking.mockRejectedValue(new Error('Delete failed'));

      const response = await request(app).delete('/bookings/booking-id');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to delete booking');
      expect(response.body.error).toBe('Delete failed');
    });
  });

  describe('handleGetBookingsByUser', () => {
    it('should get bookings for a user', async () => {
      const response = await request(app).get('/bookings/user/user-123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('bookingId', 'user-booking-1');
      expect(response.body[0]).toHaveProperty('userId', 'user-123');
      expect(mocks.getBookingsByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when user has no bookings', async () => {
      mocks.getBookingsByUserId.mockResolvedValue([]);

      const response = await request(app).get(
        '/bookings/user/user-no-bookings'
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should handle service errors when getting user bookings', async () => {
      mocks.getBookingsByUserId.mockRejectedValue(new Error('User not found'));

      const response = await request(app).get('/bookings/user/user-123');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to fetch user bookings');
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('handleMarkBookingAsUsed', () => {
    it('should mark booking as used', async () => {
      const response = await request(app).patch('/bookings/booking-123/used');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookingId', 'booking-123');
      expect(response.body).toHaveProperty('status', 'used');
      expect(mocks.markBookingAsUsed).toHaveBeenCalledWith('booking-123');
    });

    it('should return 404 if booking not found when marking as used', async () => {
      const response = await request(app).patch('/bookings/invalid-id/used');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('invalid-id');
    });

    it('should handle service errors when marking booking as used', async () => {
      mocks.markBookingAsUsed.mockRejectedValue(
        new Error('Status update failed')
      );

      const response = await request(app).patch('/bookings/booking-123/used');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to mark booking as used');
      expect(response.body.error).toBe('Status update failed');
    });
  });

  describe('handleCancelBooking', () => {
    it('should cancel a booking', async () => {
      const response = await request(app).patch('/bookings/booking-123/cancel');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookingId', 'booking-123');
      expect(response.body).toHaveProperty('status', 'canceled');
      expect(mocks.cancelBooking).toHaveBeenCalledWith('booking-123');
    });

    it('should return 404 if booking not found when canceling', async () => {
      const response = await request(app).patch('/bookings/invalid-id/cancel');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('invalid-id');
    });

    it('should handle service errors when canceling booking', async () => {
      mocks.cancelBooking.mockRejectedValue(new Error('Cancel failed'));

      const response = await request(app).patch('/bookings/booking-123/cancel');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Failed to cancel booking');
      expect(response.body.error).toBe('Cancel failed');
    });
  });
});
