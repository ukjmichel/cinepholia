import {
  createMovietheater,
  getMovietheaterById,
  getAllMovieTheaters,
  updateMovietheater,
  deleteMovietheater,
  movieTheaterService,
} from '../../controllers/movieTheater.controller';
import { Request, Response } from 'express';

jest.mock('../../services/movieTheater.service'); // Mock the service

describe('MovieTheaterController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
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
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }));
    sendMock = jest.fn();
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
    jest.clearAllMocks();
  });

  describe('createMovietheater', () => {
    it('should create a movie theater and return 201', async () => {
      (movieTheaterService.createMovieTheater as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );
      req.body = mockMovieTheater;

      await createMovietheater(req as Request, res as Response);

      expect(movieTheaterService.createMovieTheater).toHaveBeenCalledWith(
        mockMovieTheater
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater successfully created',
        data: mockMovieTheater,
      });
    });

    it('should return 500 on error', async () => {
      (movieTheaterService.createMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.body = mockMovieTheater;
      await createMovietheater(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getMovietheaterById', () => {
    it('should return a movie theater and 200', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      req.params = { theaterId: 'theater123' };
      await getMovietheaterById(req as Request, res as Response);

      expect(movieTheaterService.getMovieTheaterById).toHaveBeenCalledWith(
        'theater123'
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater found',
        data: mockMovieTheater,
      });
    });

    it('should return 404 if not found', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockResolvedValue(
        null
      );

      req.params = { theaterId: 'nonexistent' };
      await getMovietheaterById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater not found',
      });
    });

    it('should return 500 on error', async () => {
      (movieTheaterService.getMovieTheaterById as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      await getMovietheaterById(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllMovieTheaters', () => {
    it('should return movie theaters list', async () => {
      (movieTheaterService.getAllMovieTheaters as jest.Mock).mockResolvedValue([
        mockMovieTheater,
      ]);

      await getAllMovieTheaters(req as Request, res as Response);

      expect(movieTheaterService.getAllMovieTheaters).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theaters list successfully retrieved',
        data: [mockMovieTheater],
      });
    });

    it('should return 500 on error', async () => {
      (movieTheaterService.getAllMovieTheaters as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await getAllMovieTheaters(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('updateMovietheater', () => {
    it('should update a movie theater and return 200', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      req.params = { theaterId: 'theater123' };
      req.body = { city: 'New City' };

      await updateMovietheater(req as Request, res as Response);

      expect(movieTheaterService.updateMovieTheater).toHaveBeenCalledWith(
        'theater123',
        { city: 'New City' }
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater successfully updated',
        data: mockMovieTheater,
      });
    });

    it('should return 404 if movie theater not found', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockResolvedValue(
        null
      );

      req.params = { theaterId: 'nonexistent' };
      req.body = { city: 'New City' };

      await updateMovietheater(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater not found',
      });
    });

    it('should return 500 on error', async () => {
      (movieTheaterService.updateMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      req.body = { city: 'New City' };

      await updateMovietheater(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteMovietheater', () => {
    it('should delete a movie theater and return 204', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockResolvedValue(
        true
      );

      req.params = { theaterId: 'theater123' };
      await deleteMovietheater(req as Request, res as Response);

      expect(movieTheaterService.deleteMovieTheater).toHaveBeenCalledWith(
        'theater123'
      );
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should return 404 if movie theater not found', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockResolvedValue(
        false
      );

      req.params = { theaterId: 'nonexistent' };
      await deleteMovietheater(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Movie theater not found',
      });
    });

    it('should return 500 on error', async () => {
      (movieTheaterService.deleteMovieTheater as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      req.params = { theaterId: 'theater123' };
      await deleteMovietheater(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
