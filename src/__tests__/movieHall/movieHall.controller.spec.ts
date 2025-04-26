import { Request, Response } from 'express';
import * as movieHallController from '../../controllers/movieHall.controller';
import { MovieHallService } from '../../services/movieHall.service';

// Mock MovieHallService
jest.mock('../../services/movieHall.service');
const MockMovieHallService = MovieHallService as jest.MockedClass<
  typeof MovieHallService
>;

// Helpers
const mockStatus = jest.fn().mockReturnThis();
const mockJson = jest.fn();
const mockSend = jest.fn();

describe('MovieHall Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    jest.clearAllMocks();
  });

  describe('createMovieHall', () => {
    it('should create a movie hall successfully', async () => {
      (
        MockMovieHallService.prototype.createMovieHall as jest.Mock
      ).mockResolvedValueOnce({ id: 1 });

      await movieHallController.createMovieHall(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should handle service error', async () => {
      (
        MockMovieHallService.prototype.createMovieHall as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieHallController.createMovieHall(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('getMovieHall', () => {
    it('should return a movie hall', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      (
        MockMovieHallService.prototype.getMovieHall as jest.Mock
      ).mockResolvedValueOnce({ id: 1 });

      await movieHallController.getMovieHall(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should return 404 if movie hall not found', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      (
        MockMovieHallService.prototype.getMovieHall as jest.Mock
      ).mockResolvedValueOnce(null);

      await movieHallController.getMovieHall(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('getAllMovieHalls', () => {
    it('should return all movie halls', async () => {
      (
        MockMovieHallService.prototype.getAllMovieHalls as jest.Mock
      ).mockResolvedValueOnce([]);

      await movieHallController.getAllMovieHalls(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should handle service error', async () => {
      (
        MockMovieHallService.prototype.getAllMovieHalls as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieHallController.getAllMovieHalls(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('updateSeatsLayout', () => {
    it('should update seats layout successfully', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      req.body = { seatsLayout: [[1, 2, 3]] };
      (
        MockMovieHallService.prototype.updateSeatsLayout as jest.Mock
      ).mockResolvedValueOnce({ id: 1 });

      await movieHallController.updateSeatsLayout(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should return 404 if hall not found', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      req.body = { seatsLayout: [[1, 2, 3]] };
      (
        MockMovieHallService.prototype.updateSeatsLayout as jest.Mock
      ).mockResolvedValueOnce(null);

      await movieHallController.updateSeatsLayout(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('deleteMovieHall', () => {
    it('should delete movie hall successfully', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      (
        MockMovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockResolvedValueOnce(true);

      await movieHallController.deleteMovieHall(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 if hall not found', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      (
        MockMovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockResolvedValueOnce(false);

      await movieHallController.deleteMovieHall(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalled();
    });

    it('should handle service error', async () => {
      req.params = { theaterId: 'theater1', hallId: 'hallA' };
      (
        MockMovieHallService.prototype.deleteMovieHall as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieHallController.deleteMovieHall(
        req as Request,
        res as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });
});
