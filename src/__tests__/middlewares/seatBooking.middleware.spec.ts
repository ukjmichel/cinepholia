import { Request, Response, NextFunction } from 'express';
import {
  isValidSeat,
  isSeatAvailable,
} from '../../middlewares/seatBooking.middleware';
import { ScreeningService } from '../../services/screening.service';
import { MovieHallService } from '../../services/movieHall.service';
import { SeatBookingService } from '../../services/seatBooking.service';

jest.mock('../../services/screening.service');
jest.mock('../../services/movieHall.service');
jest.mock('../../services/seatBooking.service');

describe('seatBooking.middleware', () => {
  let req: Partial<Request> & {
    screening?: any;
    movieHall?: any;
    validatedSeats?: string[];
  };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  const mockScreening = {
    screeningId: 'screening123',
    theaterId: 'theaterA',
    hallId: 'hallA',
  };

  const mockMovieHall = {
    seatsLayout: [
      ['A1', 'A2', 0],
      ['B1', 'B2', 'B3'],
    ],
  };

  describe('isValidSeat', () => {
    it('should return 400 if screeningId is missing', async () => {
      await isValidSeat(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Screening ID is required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if screening is not found', async () => {
      (
        ScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(null);
      req.body.screeningId = 'missing-id';
      await isValidSeat(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if movie hall is not found', async () => {
      (
        ScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(mockScreening);
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockResolvedValue(
        null
      );
      req.body.screeningId = 'screening123';
      req.body.seatId = ['A1'];
      await isValidSeat(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if seat ID is missing', async () => {
      (
        ScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(mockScreening);
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockResolvedValue(
        mockMovieHall
      );
      req.body.screeningId = 'screening123';
      await isValidSeat(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seat ID(s) are required',
      });
    });

    it('should return 400 for invalid seat ID', async () => {
      (
        ScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(mockScreening);
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockResolvedValue(
        mockMovieHall
      );
      req.body.screeningId = 'screening123';
      req.body.seatId = ['Z9'];
      await isValidSeat(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid seat ID',
          seatId: 'Z9',
        })
      );
    });

    it('should pass if seat IDs are valid', async () => {
      (
        ScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(mockScreening);
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockResolvedValue(
        mockMovieHall
      );
      req.body.screeningId = 'screening123';
      req.body.seatId = ['A1', 'B2'];
      await isValidSeat(req as Request, res as Response, next);
      expect(req.validatedSeats).toEqual(['A1', 'B2']);
      expect(req.movieHall).toBe(mockMovieHall);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('isSeatAvailable', () => {
    it('should return 400 if screeningId is missing', async () => {
      req.body.seatId = ['A1'];
      await isSeatAvailable(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Screening ID is required',
      });
    });

    it('should return 400 if no seat IDs provided', async () => {
      req.screening = { screeningId: 'screening123' };
      req.body = {};
      await isSeatAvailable(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Seat ID(s) are required',
      });
    });

    it('should return 409 if seat is already booked', async () => {
      (
        SeatBookingService.prototype
          .getSeatBookingByScreeningIdAndSeatId as jest.Mock
      ).mockResolvedValueOnce({ seatId: 'A1' });

      req.screening = { screeningId: 'screening123' };
      req.body.seatId = ['A1'];
      await isSeatAvailable(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Seat already booked',
          seatId: 'A1',
        })
      );
    });

    it('should pass if all seats are available', async () => {
      (
        SeatBookingService.prototype
          .getSeatBookingByScreeningIdAndSeatId as jest.Mock
      ).mockResolvedValue(null);

      req.screening = { screeningId: 'screening123' };
      req.body.seatId = ['A1', 'B2'];
      await isSeatAvailable(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
