import {
  createMovieTheater,
  getMovieTheaterById,
  getAllMovieTheaters,
  updateMovieTheater,
  deleteMovieTheater,
  movieTheaterService,
} from '../../controllers/movieTheater.controller';
import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../errors/NotFoundError';

// Mock the service
jest.mock('../../services/movieTheater.service');

describe('MovieTheaterController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  const mockMovieTheater = {
    theaterId: 'theater123',
    address: '123 Main St',
    postalCode: '12345',
    city: 'Sample City',
    phone: '123-456-7890',
    email: 'test@example.com',
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

  describe('createMovieTheater', () => {
    it('should create a movie theater and return 201', async () => {
      (movieTheaterService.createMovieTheater as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      req.body = mockMovieTheater;
      await createMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(movieTheaterService.createMovieTheater).toHaveBeenCalledWith(
        mockMovieTheater
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater successfully created',
        data: mockMovieTheater,
      });
    });

    it('should call next with error on failure', async () => {
      (movieTheaterService.createMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.body = mockMovieTheater;
      await createMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMovieTheaterById', () => {
    it('should return a movie theater and 200', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      req.params = { theaterId: 'theater123' };
      await getMovieTheaterById(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater found',
        data: mockMovieTheater,
      });
    });

    it('should call next with NotFoundError if movie theater not found', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockRejectedValue(
        new NotFoundError('Not found')
      );

      req.params = { theaterId: 'nonexistent' };
      await getMovieTheaterById(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on generic failure', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      await getMovieTheaterById(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllMovieTheaters', () => {
    it('should return movie theaters list', async () => {
      (movieTheaterService.getAllMovieTheaters as jest.Mock).mockResolvedValue([
        mockMovieTheater,
      ]);

      await getAllMovieTheaters(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theaters list successfully retrieved',
        data: [mockMovieTheater],
      });
    });

    it('should call next with error on failure', async () => {
      (movieTheaterService.getAllMovieTheaters as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await getAllMovieTheaters(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateMovieTheater', () => {
    it('should update and return the movie theater and 200', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      req.params = { theaterId: 'theater123' };
      req.body = { city: 'New City' };
      await updateMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater successfully updated',
        data: mockMovieTheater,
      });
    });

    it('should call next with NotFoundError if movie theater not found', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockRejectedValue(
        new NotFoundError('Not found')
      );

      req.params = { theaterId: 'nonexistent' };
      req.body = { city: 'New City' };
      await updateMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on generic failure', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      req.body = { city: 'New City' };
      await updateMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteMovieTheater', () => {
    it('should delete a movie theater and return 204', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockResolvedValue(
        undefined
      );

      req.params = { theaterId: 'theater123' };
      await deleteMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should call next with NotFoundError if movie theater not found', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockRejectedValue(
        new NotFoundError('Not found')
      );

      req.params = { theaterId: 'nonexistent' };
      await deleteMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with error on generic failure', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      await deleteMovieTheater(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
