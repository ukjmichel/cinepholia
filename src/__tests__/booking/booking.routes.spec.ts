// src/__tests__/booking/booking.routes.spec.ts

import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mocks for controllers
const mockHandleGetAllBookings = jest.fn((req, res) =>
  res.status(200).json([
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
  ])
);

const mockHandleGetBookingById = jest.fn((req, res) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'pending',
  })
);

const mockHandleCreateBooking = jest.fn((req, res) =>
  res.status(201).json({
    message: 'Booking created successfully',
    booking: {
      bookingId: 'test-uuid-123',
      userId: req.user?.id || 'unknown',
      screeningId: req.body.screeningId,
      seatsNumber: req.body.seatsNumber,
      status: 'pending',
    },
    seats: req.body.seatIds.map((seatId: string) => ({
      screeningId: req.body.screeningId,
      seatId,
      bookingId: 'test-uuid-123',
    })),
    totalSeats: req.body.seatIds.length,
  })
);

const mockHandleUpdateBooking = jest.fn((req, res) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: req.body.status || 'pending',
  })
);

const mockHandleDeleteBooking = jest.fn((req, res) => res.status(204).send());

const mockHandleMarkBookingAsUsed = jest.fn((req, res) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'used',
  })
);

const mockHandleCancelBooking = jest.fn((req, res) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'canceled',
  })
);

const mockHandleGetBookingsByUser = jest.fn((req, res) =>
  res
    .status(200)
    .json([
      {
        bookingId: 'u1',
        userId: req.params.userId,
        screeningId: 's1',
        seatsNumber: 2,
        status: 'pending',
      },
    ])
);

// Mock modules
jest.mock('../../controllers/booking.controller', () => ({
  handleCreateBooking: mockHandleCreateBooking,
  handleGetBookingById: mockHandleGetBookingById,
  handleGetAllBookings: mockHandleGetAllBookings,
  handleUpdateBooking: mockHandleUpdateBooking,
  handleDeleteBooking: mockHandleDeleteBooking,
  handleMarkBookingAsUsed: mockHandleMarkBookingAsUsed,
  handleCancelBooking: mockHandleCancelBooking,
  handleGetBookingsByUser: mockHandleGetBookingsByUser,
}));

jest.mock('../../validators/booking.validator', () => ({
  validateBookingRequest: (req: Request, res: Response, next: NextFunction) =>
    next(),
}));

jest.mock('../../middlewares/screening.middleware', () => ({
  isScreeningExist: (req: Request, res: Response, next: NextFunction) => next(),
}));

jest.mock('../../middlewares/seatBooking.middleware', () => ({
  isSeatAvailable: (req: Request, res: Response, next: NextFunction) => next(),
  isValidSeat: (req: Request, res: Response, next: NextFunction) => next(),
}));

const mockAuthenticateJwt = jest.fn(
  (req: Request, res: Response, next: NextFunction) => {
    req.user = {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    next();
  }
);

jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: mockAuthenticateJwt,
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: Request, res: Response, next: NextFunction) =>
      next(),
    isBookingOwnerOrStaff:
      () => (req: Request, res: Response, next: NextFunction) =>
        next(),
    isNotStaff: () => (req: Request, res: Response, next: NextFunction) =>
      next(),
    selfOrStaff: () => (req: Request, res: Response, next: NextFunction) =>
      next(),
  },
}));

import  bookingRouter  from '../../routes/booking.routes';

describe('Booking Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/bookings', bookingRouter);
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res
        .status(err.statusCode || 500)
        .json({ message: err.message || 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({
          screeningId: 'screening-uuid',
          seatsNumber: 2,
          seatIds: ['s1', 's2'],
        });
      expect(res.status).toBe(201);
      expect(res.body.booking).toBeDefined();
      expect(res.body.seats).toHaveLength(2);
      expect(mockHandleCreateBooking).toHaveBeenCalled();
      expect(mockAuthenticateJwt).toHaveBeenCalled();
    });
  });

  describe('GET /bookings/:bookingId', () => {
    it('should return a booking', async () => {
      const res = await request(app).get('/bookings/booking-123');
      expect(res.status).toBe(200);
      expect(res.body.bookingId).toBe('booking-123');
      expect(mockHandleGetBookingById).toHaveBeenCalled();
    });
  });

  describe('GET /bookings', () => {
    it('should return all bookings', async () => {
      const res = await request(app).get('/bookings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(mockHandleGetAllBookings).toHaveBeenCalled();
    });
  });

  describe('PUT /bookings/:bookingId', () => {
    it('should update a booking', async () => {
      const res = await request(app)
        .put('/bookings/booking-123')
        .send({ status: 'used' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('used');
      expect(mockHandleUpdateBooking).toHaveBeenCalled();
    });
  });

  describe('DELETE /bookings/:bookingId', () => {
    it('should delete a booking', async () => {
      const res = await request(app).delete('/bookings/booking-123');
      expect(res.status).toBe(204);
      expect(mockHandleDeleteBooking).toHaveBeenCalled();
    });
  });

  describe('PATCH /bookings/:bookingId/used', () => {
    it('should mark booking as used', async () => {
      const res = await request(app).patch('/bookings/booking-123/used');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('used');
      expect(mockHandleMarkBookingAsUsed).toHaveBeenCalled();
    });
  });

  describe('PATCH /bookings/:bookingId/cancel', () => {
    it('should cancel booking', async () => {
      const res = await request(app).patch('/bookings/booking-123/cancel');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('canceled');
      expect(mockHandleCancelBooking).toHaveBeenCalled();
    });
  });

  describe('GET /bookings/user/:userId', () => {
    it('should return user bookings', async () => {
      const res = await request(app).get('/bookings/user/user-123');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].userId).toBe('user-123');
      expect(mockHandleGetBookingsByUser).toHaveBeenCalled();
    });
  });

  describe('Route Precedence', () => {
    it('should prioritize /user/:userId before /:bookingId', async () => {
      const userRes = await request(app).get('/bookings/user/user-abc');
      expect(userRes.status).toBe(200);
      expect(Array.isArray(userRes.body)).toBe(true);

      jest.clearAllMocks();

      const bookingRes = await request(app).get('/bookings/booking-xyz');
      expect(bookingRes.status).toBe(200);
      expect(bookingRes.body.bookingId).toBe('booking-xyz');
    });
  });
});
