import { Request, Response, NextFunction } from 'express';
import {
  handleCreateScreening,
  handleGetScreeningById,
  handleGetAllScreenings,
  handleUpdateScreening,
  handleDeleteScreening,
  handleSearchScreenings,
  screeningService,
} from '../../controllers/screening.controller';
import { ScreeningAttributes } from '../../models/screening.model';
import { NotFoundError } from '../../errors/NotFoundError';

jest.mock('../../services/screening.service'); // Mock the whole service

describe('Screening Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  const mockScreening: ScreeningAttributes = {
    screeningId: 'screening-uuid',
    movieId: 'movie-uuid',
    theaterId: 'theater-uuid',
    hallId: 'hall-uuid',
    startTime: new Date('2025-01-01T18:00:00Z'),
    durationTime: '02:30:00',
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(function (this: any) {
      return this;
    }); // Important: make statusMock return res
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('handleCreateScreening', () => {
    it('should create a screening successfully', async () => {
      (screeningService.createScreening as jest.Mock).mockResolvedValue(
        mockScreening
      );
      req.body = mockScreening;

      await handleCreateScreening(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Screening successfully created',
        data: mockScreening,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Database error');
      (screeningService.createScreening as jest.Mock).mockRejectedValue(error);
      req.body = mockScreening;

      await handleCreateScreening(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetScreeningById', () => {
    it('should return a screening if found', async () => {
      (screeningService.getScreeningById as jest.Mock).mockResolvedValue(
        mockScreening
      );
      req.params = { screeningId: 'screening-uuid' };

      await handleGetScreeningById(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Screening found',
        data: mockScreening,
      });
    });

    it('should call next if unknown error', async () => {
      const error = new Error('Unknown error');
      (screeningService.getScreeningById as jest.Mock).mockRejectedValue(error);
      req.params = { screeningId: 'screening-uuid' };

      await handleGetScreeningById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetAllScreenings', () => {
    it('should return all screenings', async () => {
      (screeningService.getAllScreenings as jest.Mock).mockResolvedValue([
        mockScreening,
      ]);

      await handleGetAllScreenings(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'List of screenings retrieved successfully',
        data: [mockScreening],
      });
    });

    it('should call next if error', async () => {
      const error = new Error('Unknown error');
      (screeningService.getAllScreenings as jest.Mock).mockRejectedValue(error);

      await handleGetAllScreenings(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleUpdateScreening', () => {
    it('should update screening successfully', async () => {
      (screeningService.updateScreening as jest.Mock).mockResolvedValue(
        mockScreening
      );
      req.params = { screeningId: 'screening-uuid' };
      req.body = { startTime: new Date() };

      await handleUpdateScreening(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Screening successfully updated',
        data: mockScreening,
      });
    });

    it('should call next on unknown error', async () => {
      const error = new Error('Update error');
      (screeningService.updateScreening as jest.Mock).mockRejectedValue(error);
      req.params = { screeningId: 'screening-uuid' };

      await handleUpdateScreening(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleDeleteScreening', () => {
    it('should delete screening successfully', async () => {
      (screeningService.deleteScreening as jest.Mock).mockResolvedValue(
        undefined
      );
      req.params = { screeningId: 'screening-uuid' };

      await handleDeleteScreening(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should call next on unknown error', async () => {
      const error = new Error('Delete error');
      (screeningService.deleteScreening as jest.Mock).mockRejectedValue(error);
      req.params = { screeningId: 'screening-uuid' };

      await handleDeleteScreening(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleSearchScreenings', () => {
    it('should return screenings if theaterId and movieId provided', async () => {
      (
        screeningService.getScreeningsByTheaterAndMovieId as jest.Mock
      ).mockResolvedValue([mockScreening]);
      req.query = { theaterId: 'theater-uuid', movieId: 'movie-uuid' };

      await handleSearchScreenings(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Screenings retrieved successfully',
        data: [mockScreening],
      });
    });

    it('should return 400 if missing theaterId or movieId', async () => {
      req.query = { theaterId: 'theater-uuid' }; // Missing movieId

      await handleSearchScreenings(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Both theaterId and movieId query parameters are required',
      });
    });

    it('should call next if error', async () => {
      const error = new Error('Search error');
      (
        screeningService.getScreeningsByTheaterAndMovieId as jest.Mock
      ).mockRejectedValue(error);
      req.query = { theaterId: 'theater-uuid', movieId: 'movie-uuid' };

      await handleSearchScreenings(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
