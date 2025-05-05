import {
  createMovieHall,
  getMovieHall,
  getAllMovieHalls,
  updateSeatsLayout,
  deleteMovieHall,
} from '../../controllers/movieHall.controller';
import { Request, Response, NextFunction } from 'express';
import { MovieHallService } from '../../services/movieHall.service';
import { NotFoundError } from '../../errors/NotFoundError';

// Mock the service
jest.mock('../../services/movieHall.service');

describe('MovieHallController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  const mockMovieHall = {
    theaterId: 'theater123',
    hallId: 'hallA',
    seatsLayout: [
      [1, 2, 3],
      ['x', 4, 5],
    ],
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }));
    req = {};
    res = { status: statusMock, json: jsonMock, send: sendMock };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createMovieHall', () => {
    it('should create a movie hall and return 201', async () => {
      (
        MovieHallService.prototype.createMovieHall as jest.Mock
      ).mockResolvedValue(mockMovieHall);

      req.body = mockMovieHall;
      await createMovieHall(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(MovieHallService.prototype.createMovieHall).toHaveBeenCalledWith(
        mockMovieHall
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie hall successfully created',
        data: mockMovieHall,
      });
    });

    it('should call next with error on failure', async () => {
      (
        MovieHallService.prototype.createMovieHall as jest.Mock
      ).mockRejectedValue(new Error('Failed'));

      req.body = mockMovieHall;
      await createMovieHall(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMovieHall', () => {
    it('should return a movie hall and 200', async () => {
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockResolvedValue(
        mockMovieHall
      );

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      await getMovieHall(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie hall found',
        data: mockMovieHall,
      });
    });

    it('should call next with NotFoundError if hall not found', async () => {
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockRejectedValue(
        new NotFoundError('Not found')
      );

      req.params = { theaterId: 'unknown', hallId: 'unknown' };
      await getMovieHall(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on failure', async () => {
      (MovieHallService.prototype.getMovieHall as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      await getMovieHall(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllMovieHalls', () => {
    it('should return all movie halls', async () => {
      (
        MovieHallService.prototype.getAllMovieHalls as jest.Mock
      ).mockResolvedValue([mockMovieHall]);

      await getAllMovieHalls(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'List of movie halls retrieved successfully',
        data: [mockMovieHall],
      });
    });

    it('should call next with error on failure', async () => {
      (
        MovieHallService.prototype.getAllMovieHalls as jest.Mock
      ).mockRejectedValue(new Error('Failed'));

      await getAllMovieHalls(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateSeatsLayout', () => {
    it('should update and return updated movie hall', async () => {
      (
        MovieHallService.prototype.updateSeatsLayout as jest.Mock
      ).mockResolvedValue(mockMovieHall);

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      req.body = { seatsLayout: [[1, 'x', 2]] };

      await updateSeatsLayout(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Seats layout successfully updated',
        data: mockMovieHall,
      });
    });

    it('should call next with NotFoundError if hall not found', async () => {
      (
        MovieHallService.prototype.updateSeatsLayout as jest.Mock
      ).mockRejectedValue(new NotFoundError('Not found'));

      req.params = { theaterId: 'unknown', hallId: 'unknown' };
      req.body = { seatsLayout: [[1, 'x', 2]] };

      await updateSeatsLayout(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on failure', async () => {
      (
        MovieHallService.prototype.updateSeatsLayout as jest.Mock
      ).mockRejectedValue(new Error('Failed'));

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      req.body = { seatsLayout: [[1, 2, 3]] };

      await updateSeatsLayout(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteMovieHall', () => {
    it('should delete a movie hall and return 204', async () => {
      (
        MovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockResolvedValue(undefined);

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      await deleteMovieHall(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should call next with NotFoundError if hall not found', async () => {
      (
        MovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockRejectedValue(new NotFoundError('Not found'));

      req.params = { theaterId: 'unknown', hallId: 'unknown' };
      await deleteMovieHall(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on failure', async () => {
      (
        MovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockRejectedValue(new Error('Failed'));

      req.params = { theaterId: 'theater123', hallId: 'hallA' };
      await deleteMovieHall(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
