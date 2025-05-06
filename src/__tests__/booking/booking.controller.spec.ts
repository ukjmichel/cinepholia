// src/__tests__/booking/booking.controller.spec.ts

import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { BookingAttributes } from '../../models/booking.model';

// Mock the services
jest.mock('../../services/booking.service', () => {
  return {
    BookingService: jest.fn().mockImplementation(() => ({
      createBooking: jest.fn(),
      getBookingById: jest.fn(),
      getAllBookings: jest.fn(),
      updateBooking: jest.fn(),
      deleteBooking: jest.fn(),
      getBookingsByUserId: jest.fn(),
      markBookingAsUsed: jest.fn(),
      cancelBooking: jest.fn(),
    })),
  };
});

jest.mock('../../services/screening.service', () => {
  return {
    ScreeningService: jest.fn().mockImplementation(() => ({
      getScreeningById: jest.fn(),
    })),
  };
});

jest.mock('../../services/seatBooking.service', () => {
  return {
    SeatBookingService: jest.fn().mockImplementation(() => ({
      checkSeatsExist: jest.fn(),
      checkSeatsAvailable: jest.fn(),
      createSeatBooking: jest.fn(),
      deleteSeatBookingsByBookingId: jest.fn(),
    })),
  };
});

jest.mock('../../services/movieHall.service', () => {
  return {
    MovieHallService: jest.fn().mockImplementation(() => ({})),
  };
});

// Mock sequelize transaction
jest.mock('../../config/db', () => ({
  sequelize: {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Import controllers after mocking
import {
  handleCreateBooking,
  handleGetBookingById,
  handleGetAllBookings,
  handleUpdateBooking,
  handleDeleteBooking,
  handleMarkBookingAsUsed,
  handleCancelBooking,
  handleGetBookingsByUser,
  screeningService,
  seatBookingService,
  bookingService,
} from '../../controllers/booking.controller';

// Error handler middleware
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    status: status,
    message: message,
  });
};

// Helper to validate errors
const validateErrorResponse = (
  res: request.Response,
  statusCode: number,
  message: string
) => {
  expect(res.status).toBe(statusCode);
  expect(res.body.message).toContain(message);
};

describe('BookingController', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Authentication middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      req.user = {
        id: 'user-uuid',
        name: 'Test User',
        email: 'test@example.com',
      };
      next();
    });

    // Mount routes
    app.post('/bookings', handleCreateBooking);
    app.get('/bookings', handleGetAllBookings);
    app.get('/bookings/:bookingId', handleGetBookingById);
    app.put('/bookings/:bookingId', handleUpdateBooking);
    app.delete('/bookings/:bookingId', handleDeleteBooking);
    app.patch('/bookings/:bookingId/used', handleMarkBookingAsUsed);
    app.patch('/bookings/:bookingId/cancel', handleCancelBooking);
    app.get('/bookings/user/:userId', handleGetBookingsByUser);

    // Add error handling middleware
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCreateBooking', () => {
    it('should create a booking successfully', async () => {
      // Setup mocks for this test
      seatBookingService.checkSeatsExist = jest.fn().mockResolvedValue(true);
      seatBookingService.checkSeatsAvailable = jest
        .fn()
        .mockResolvedValue(true);
      seatBookingService.createSeatBooking = jest
        .fn()
        .mockImplementation((data) => Promise.resolve(data));

      bookingService.createBooking = jest.fn().mockImplementation((data) =>
        Promise.resolve({
          ...data,
          status: 'pending',
        })
      );

      const res = await request(app)
        .post('/bookings')
        .send({
          screeningId: 'screening-uuid',
          seatsNumber: 2,
          seatIds: ['s1', 's2'],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('booking');
      expect(res.body.booking).toBeDefined();
    });

    it('should return 400 if no seats provided', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({ screeningId: 'screening-uuid', seatsNumber: 2 });

      validateErrorResponse(res, 400, 'No seats selected');
    });

    it('should return 400 if seats number mismatch', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({
          screeningId: 'screening-uuid',
          seatsNumber: 3,
          seatIds: ['s1', 's2'],
        });

      validateErrorResponse(res, 400, 'Seats number mismatch');
    });
  });

  describe('handleGetBookingById', () => {
    it('should retrieve a booking by ID', async () => {
      // Setup mock for this test
      bookingService.getBookingById = jest.fn().mockResolvedValue({
        bookingId: 'booking-123',
        userId: 'user-uuid',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'pending',
      });

      const res = await request(app).get('/bookings/booking-123');

      expect(res.status).toBe(200);
      expect(res.body.bookingId).toBe('booking-123');
    });

    it('should return 404 if booking not found', async () => {
      // Setup mock for this test
      bookingService.getBookingById = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/bookings/invalid-id');

      validateErrorResponse(res, 404, 'Booking with ID invalid-id not found');
    });
  });

  describe('handleGetAllBookings', () => {
    it('should retrieve all bookings', async () => {
      // Setup mock for this test
      bookingService.getAllBookings = jest.fn().mockResolvedValue([
        {
          bookingId: 'b1',
          userId: 'user-uuid',
          screeningId: 's1',
          seatsNumber: 2,
          status: 'pending',
        },
        {
          bookingId: 'b2',
          userId: 'user-uuid',
          screeningId: 's2',
          seatsNumber: 1,
          status: 'used',
        },
      ]);

      const res = await request(app).get('/bookings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('handleUpdateBooking', () => {
    it('should update a booking successfully', async () => {
      // Setup mock for this test
      bookingService.updateBooking = jest.fn().mockResolvedValue({
        bookingId: 'booking-123',
        userId: 'user-uuid',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'used',
      });

      const res = await request(app)
        .put('/bookings/booking-123')
        .send({ status: 'used' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('used');
    });

    it('should return 404 if booking not found for update', async () => {
      // Setup mock for this test
      bookingService.updateBooking = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .put('/bookings/invalid-id')
        .send({ status: 'used' });

      validateErrorResponse(res, 404, 'Booking with ID invalid-id not found');
    });
  });

  describe('handleDeleteBooking', () => {
    it('should delete a booking successfully', async () => {
      // Setup mocks for this test
      seatBookingService.deleteSeatBookingsByBookingId = jest
        .fn()
        .mockResolvedValue(true);
      bookingService.deleteBooking = jest.fn().mockResolvedValue(true);

      const res = await request(app).delete('/bookings/booking-123');

      expect(res.status).toBe(204);
    });

    it('should return 404 if booking not found during deletion', async () => {
      // Setup mocks for this test
      seatBookingService.deleteSeatBookingsByBookingId = jest
        .fn()
        .mockResolvedValue(true);
      bookingService.deleteBooking = jest.fn().mockResolvedValue(false);

      const res = await request(app).delete('/bookings/invalid-id');

      validateErrorResponse(res, 404, 'Booking with ID invalid-id not found');
    });
  });

  describe('handleMarkBookingAsUsed', () => {
    it('should mark a booking as used', async () => {
      // Setup mock for this test
      bookingService.markBookingAsUsed = jest.fn().mockResolvedValue({
        bookingId: 'booking-123',
        userId: 'user-uuid',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'used',
      });

      const res = await request(app).patch('/bookings/booking-123/used');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('used');
    });

    it('should return 404 if booking not found for mark as used', async () => {
      // Setup mock for this test
      bookingService.markBookingAsUsed = jest.fn().mockResolvedValue(null);

      const res = await request(app).patch('/bookings/invalid-id/used');

      validateErrorResponse(res, 404, 'Booking with ID invalid-id not found');
    });
  });

  describe('handleCancelBooking', () => {
    it('should cancel a booking', async () => {
      // Setup mock for this test
      bookingService.cancelBooking = jest.fn().mockResolvedValue({
        bookingId: 'booking-123',
        userId: 'user-uuid',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'canceled',
      });

      const res = await request(app).patch('/bookings/booking-123/cancel');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('canceled');
    });

    it('should return 404 if booking not found for cancel', async () => {
      // Setup mock for this test
      bookingService.cancelBooking = jest.fn().mockResolvedValue(null);

      const res = await request(app).patch('/bookings/invalid-id/cancel');

      validateErrorResponse(res, 404, 'Booking with ID invalid-id not found');
    });
  });

  describe('handleGetBookingsByUser', () => {
    it('should retrieve bookings for a user', async () => {
      // Setup mock for this test
      bookingService.getBookingsByUserId = jest.fn().mockResolvedValue([
        {
          bookingId: 'u1',
          userId: 'user-uuid',
          screeningId: 's1',
          seatsNumber: 2,
          status: 'pending',
        },
      ]);

      const res = await request(app).get('/bookings/user/user-uuid');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });
});
