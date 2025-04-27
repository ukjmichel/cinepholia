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
    const mockBooking = { seatId: 'A1' };
    (
      MockSeatBookingService.prototype.createSeatBooking as jest.Mock
    ).mockResolvedValue(mockBooking);

    req.body = {
      screeningId: 'screening-id',
      seatId: 'A1',
      bookingId: 'booking-id',
    };

    await handleCreateSeatBooking(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(mockBooking);
  });

  it('should fetch a seat booking by screeningId and seatId', async () => {
    const mockSeat = { seatId: 'A1' };
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
    (
      MockSeatBookingService.prototype.getSeatBookingsByBookingId as jest.Mock
    ).mockResolvedValue([{ seatId: 'A2' }]);

    req.params = { bookingId: 'booking-id' };

    await handleGetSeatBookingsByBookingId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith([{ seatId: 'A2' }]);
  });

  it('should fetch seat bookings by screeningId', async () => {
    (
      MockSeatBookingService.prototype.getSeatBookingsByScreeningId as jest.Mock
    ).mockResolvedValue([{ seatId: 'A3' }]);

    req.params = { screeningId: 'screening-id' };

    await handleGetSeatBookingsByScreeningId(
      req as Request,
      res as Response,
      next
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith([{ seatId: 'A3' }]);
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
});
