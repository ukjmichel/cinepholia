// src/__tests__/seatBooking/seatBooking.controller.spec.ts

import { Request, Response } from 'express';
import {
  handleCreateSeatBooking,
  handleGetSeatBookingByScreeningAndSeat,
  handleGetSeatBookingsByBookingId,
  handleGetSeatBookingsByScreeningId,
  handleDeleteSeatBooking,
} from '../../controllers/seatBooking.controller';
import { SeatBookingService } from '../../services/seatBooking.service';
import { SeatBookingAttributes } from '../../models/seatBooking.model';

// 🧪 Mock SeatBookingService
jest.mock('../../services/seatBooking.service');
const MockSeatBookingService = SeatBookingService as jest.MockedClass<
  typeof SeatBookingService
>;

describe('SeatBooking Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  const mockStatus = jest.fn().mockReturnThis();
  const mockJson = jest.fn();
  const mockSend = jest.fn();

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    next = jest.fn();

    mockStatus.mockClear();
    mockJson.mockClear();
    mockSend.mockClear();
    next.mockClear();

    (
      MockSeatBookingService.prototype.createSeatBooking as jest.Mock
    ).mockReset();
    (
      MockSeatBookingService.prototype
        .getSeatBookingByScreeningIdAndSeatId as jest.Mock
    ).mockReset();
    (
      MockSeatBookingService.prototype.getSeatBookingsByBookingId as jest.Mock
    ).mockReset();
    (
      MockSeatBookingService.prototype.getSeatBookingsByScreeningId as jest.Mock
    ).mockReset();
    (
      MockSeatBookingService.prototype.deleteSeatBooking as jest.Mock
    ).mockReset();
  });

  it('should create a seat booking successfully', async () => {
    const mockBooking: SeatBookingAttributes = {
      screeningId: 'screening-id',
      bookingId: 'booking-id',
      seatId: 'A1',
    };

    (
      MockSeatBookingService.prototype.createSeatBooking as jest.Mock
    ).mockResolvedValue(mockBooking);

    req.body = mockBooking;

    await handleCreateSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(mockBooking);
  });

  it('should fetch a seat booking by screeningId and seatId', async () => {
    const mockSeat: SeatBookingAttributes = {
      screeningId: 'screening-id',
      bookingId: 'booking-id',
      seatId: 'A1',
    };

    (
      MockSeatBookingService.prototype
        .getSeatBookingByScreeningIdAndSeatId as jest.Mock
    ).mockResolvedValue(mockSeat);

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleGetSeatBookingByScreeningAndSeat(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(mockSeat);
  });

  it('should return 404 if seat booking not found', async () => {
    (
      MockSeatBookingService.prototype
        .getSeatBookingByScreeningIdAndSeatId as jest.Mock
    ).mockResolvedValue(null);

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleGetSeatBookingByScreeningAndSeat(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalled();
  });

  it('should fetch seat bookings by bookingId', async () => {
    const mockBookings: SeatBookingAttributes[] = [
      {
        screeningId: 'screening-id',
        bookingId: 'booking-id',
        seatId: 'A2',
      },
    ];

    (
      MockSeatBookingService.prototype.getSeatBookingsByBookingId as jest.Mock
    ).mockResolvedValue(mockBookings);

    req.params = { bookingId: 'booking-id' };

    await handleGetSeatBookingsByBookingId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(mockBookings);
  });

  it('should fetch seat bookings by screeningId', async () => {
    const mockBookings: SeatBookingAttributes[] = [
      {
        screeningId: 'screening-id',
        bookingId: 'booking-id',
        seatId: 'A3',
      },
    ];

    (
      MockSeatBookingService.prototype.getSeatBookingsByScreeningId as jest.Mock
    ).mockResolvedValue(mockBookings);

    req.params = { screeningId: 'screening-id' };

    await handleGetSeatBookingsByScreeningId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(mockBookings);
  });

  it('should delete a seat booking', async () => {
    (
      MockSeatBookingService.prototype.deleteSeatBooking as jest.Mock
    ).mockResolvedValue(true);

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleDeleteSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(204);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should return 404 if seat booking to delete not found', async () => {
    (
      MockSeatBookingService.prototype.deleteSeatBooking as jest.Mock
    ).mockResolvedValue(false);

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleDeleteSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalled();
  });

  it('should handle error when creating seat booking', async () => {
    (
      MockSeatBookingService.prototype.createSeatBooking as jest.Mock
    ).mockRejectedValue(new Error('Boom'));

    req.body = {
      screeningId: 'screening-id',
      bookingId: 'booking-id',
      seatId: 'A1',
    };

    await handleCreateSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Failed to create seat booking',
      error: 'Boom',
    });
  });

  it('should handle error when fetching seat booking by screeningId and seatId', async () => {
    (
      MockSeatBookingService.prototype
        .getSeatBookingByScreeningIdAndSeatId as jest.Mock
    ).mockRejectedValue(new Error('Boom'));

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleGetSeatBookingByScreeningAndSeat(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Failed to fetch seat booking',
      error: 'Boom',
    });
  });

  it('should handle error when fetching seat bookings by bookingId', async () => {
    (
      MockSeatBookingService.prototype.getSeatBookingsByBookingId as jest.Mock
    ).mockRejectedValue(new Error('Boom'));

    req.params = { bookingId: 'booking-id' };

    await handleGetSeatBookingsByBookingId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Failed to fetch seat bookings',
      error: 'Boom',
    });
  });

  it('should handle error when fetching seat bookings by screeningId', async () => {
    (
      MockSeatBookingService.prototype.getSeatBookingsByScreeningId as jest.Mock
    ).mockRejectedValue(new Error('Boom'));

    req.params = { screeningId: 'screening-id' };

    await handleGetSeatBookingsByScreeningId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Failed to fetch seat bookings',
      error: 'Boom',
    });
  });

  it('should handle error when deleting seat booking', async () => {
    (
      MockSeatBookingService.prototype.deleteSeatBooking as jest.Mock
    ).mockRejectedValue(new Error('Boom'));

    req.params = { screeningId: 'screening-id', seatId: 'A1' };

    await handleDeleteSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Failed to delete seat booking',
      error: 'Boom',
    });
  });

});
