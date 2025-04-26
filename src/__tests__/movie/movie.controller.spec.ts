import { Request, Response } from 'express';
import { movieService } from '../../controllers/movie.controller';
import * as movieController from '../../controllers/movie.controller';

// Mock movieService methods
jest.mock('../../services/movie.service', () => {
  return {
    MovieService: jest.fn().mockImplementation(() => ({
      createMovie: jest.fn(),
      getMovieById: jest.fn(),
      getAllMovies: jest.fn(),
      updateMovie: jest.fn(),
      deleteMovie: jest.fn(),
    })),
  };
});

describe('MovieController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let send: jest.Mock;

  beforeEach(() => {
    send = jest.fn();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json, send });

    req = {
      params: {},
      body: {},
    };

    res = {
      status,
      json,
      send,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovie', () => {
    it('should return 201 on successful creation', async () => {
      (movieService.createMovie as jest.Mock).mockResolvedValue({
        id: 'movie123',
      });

      await movieController.createMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        message: 'Movie successfully created',
        data: { id: 'movie123' },
      });
    });

    it('should return 500 if service throws error', async () => {
      (movieService.createMovie as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      await movieController.createMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Failed to create movie',
        error: expect.anything(),
      });
    });
  });

  describe('getMovieById', () => {
    it('should return 200 if movie found', async () => {
      req.params = { movieId: 'movie123' };
      (movieService.getMovieById as jest.Mock).mockResolvedValue({
        movieId: 'movie123',
      });

      await movieController.getMovieById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'Movie found',
        data: { movieId: 'movie123' },
      });
    });

    it('should return 404 if movie not found', async () => {
      req.params = { movieId: 'unknown' };
      (movieService.getMovieById as jest.Mock).mockResolvedValue(null);

      await movieController.getMovieById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      (movieService.getMovieById as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      await movieController.getMovieById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Failed to get movie',
        error: expect.anything(),
      });
    });
  });

  describe('getAllMovies', () => {
    it('should return 200 and list movies', async () => {
      (movieService.getAllMovies as jest.Mock).mockResolvedValue([
        { movieId: 'm1' },
      ]);

      await movieController.getAllMovies(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'Movies list successfully retrieved',
        data: [{ movieId: 'm1' }],
      });
    });

    it('should return 500 on error', async () => {
      (movieService.getAllMovies as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      await movieController.getAllMovies(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Failed to get movies',
        error: expect.anything(),
      });
    });
  });

  describe('updateMovie', () => {
    it('should return 200 on successful update', async () => {
      req.params = { movieId: 'movie123' };
      (movieService.updateMovie as jest.Mock).mockResolvedValue({
        movieId: 'movie123',
      });

      await movieController.updateMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'Movie successfully updated',
        data: { movieId: 'movie123' },
      });
    });

    it('should return 404 if movie not found', async () => {
      (movieService.updateMovie as jest.Mock).mockResolvedValue(null);

      await movieController.updateMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      (movieService.updateMovie as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      await movieController.updateMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Failed to update movie',
        error: expect.anything(),
      });
    });
  });

  describe('deleteMovie', () => {
    it('should return 204 on successful delete', async () => {
      req.params = { movieId: 'movie123' };
      (movieService.deleteMovie as jest.Mock).mockResolvedValue(true);

      await movieController.deleteMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(204);
      expect(send).toHaveBeenCalled();
    });

    it('should return 404 if movie not found', async () => {
      (movieService.deleteMovie as jest.Mock).mockResolvedValue(false);

      await movieController.deleteMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should return 500 on error', async () => {
      (movieService.deleteMovie as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      await movieController.deleteMovie(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Failed to delete movie',
        error: expect.anything(),
      });
    });
  });
});
