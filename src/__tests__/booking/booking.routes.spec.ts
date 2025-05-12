// src/__tests__/booking/booking.routes.spec.ts

import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock implementations for controller handlers
const mockHandleCreateBooking = jest.fn((req: Request, res: Response) =>
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

const mockHandleGetAllBookings = jest.fn((req: Request, res: Response) =>
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

const mockHandleGetBookingById = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'pending',
  })
);

const mockHandleUpdateBooking = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: req.body.status || 'pending',
  })
);

const mockHandleDeleteBooking = jest.fn((req: Request, res: Response) =>
  res.status(204).send()
);

const mockHandleMarkBookingAsUsed = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'used',
  })
);

const mockHandleCancelBooking = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    bookingId: req.params.bookingId,
    userId: 'user-uuid',
    screeningId: 'screening-123',
    seatsNumber: 2,
    status: 'canceled',
  })
);

const mockHandleGetBookingsByUser = jest.fn((req: Request, res: Response) =>
  res.status(200).json([
    {
      bookingId: 'u1',
      userId: req.params.userId,
      screeningId: 's1',
      seatsNumber: 2,
      status: 'pending',
    },
  ])
);

// Module mocks
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
  validateBookingRequest: (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (_req: Request, _res: Response, next: NextFunction) => {
    _req.user = {
      id: 'user-uuid',
      name: 'Test User',
      email: 'test@example.com',
    };
    next();
  },
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (_req: Request, _res: Response, next: NextFunction) =>
      next(),
    isBookingOwnerOrStaff:
      () => (_req: Request, _res: Response, next: NextFunction) =>
        next(),
    isNotStaff: () => (_req: Request, _res: Response, next: NextFunction) =>
      next(),
    selfOrStaff: () => (_req: Request, _res: Response, next: NextFunction) =>
      next(),
  },
}));

import bookingRouter from '../../routes/booking.routes';

describe('Booking Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/bookings', bookingRouter);
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      res
        .status(err.statusCode || 500)
        .json({ message: err.message || 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /bookings should create a booking', async () => {
    const res = await request(app)
      .post('/bookings')
      .send({
        screeningId: 'screening-uuid',
        seatsNumber: 2,
        seatIds: ['s1', 's2'],
      });
    expect(res.status).toBe(201);
    expect(mockHandleCreateBooking).toHaveBeenCalled();
  });

  it('GET /bookings should return all bookings', async () => {
    const res = await request(app).get('/bookings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleGetAllBookings).toHaveBeenCalled();
  });

  it('GET /bookings/:bookingId should return one booking', async () => {
    const res = await request(app).get('/bookings/booking-123');
    expect(res.status).toBe(200);
    expect(res.body.bookingId).toBe('booking-123');
  });

  it('PUT /bookings/:bookingId should update booking', async () => {
    const res = await request(app)
      .put('/bookings/booking-123')
      .send({ status: 'used' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('used');
  });

  it('DELETE /bookings/:bookingId should delete booking', async () => {
    const res = await request(app).delete('/bookings/booking-123');
    expect(res.status).toBe(204);
  });

  it('PATCH /bookings/:bookingId/used should mark as used', async () => {
    const res = await request(app).patch('/bookings/booking-123/used');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('used');
  });

  it('PATCH /bookings/:bookingId/cancel should mark as canceled', async () => {
    const res = await request(app).patch('/bookings/booking-123/cancel');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('canceled');
  });

  it('GET /bookings/user/:userId should return user bookings', async () => {
    const res = await request(app).get('/bookings/user/user-123');
    expect(res.status).toBe(200);
    expect(res.body[0].userId).toBe('user-123');
  });

  it('Route precedence: /user/:userId before /:bookingId', async () => {
    const userRes = await request(app).get('/bookings/user/user-abc');
    expect(userRes.status).toBe(200);
    expect(Array.isArray(userRes.body)).toBe(true);

    const bookingRes = await request(app).get('/bookings/booking-xyz');
    expect(bookingRes.status).toBe(200);
    expect(bookingRes.body.bookingId).toBe('booking-xyz');
  });
});
