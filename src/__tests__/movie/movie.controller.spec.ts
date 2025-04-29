// src/__tests__/movie/movie.controller.spec.ts
import { Request, Response } from 'express';
import * as movieController from '../../controllers/movie.controller';
import { MovieService } from '../../services/movie.service';

// Mock MovieService
jest.mock('../../services/movie.service');
const MockMovieService = MovieService as jest.MockedClass<typeof MovieService>;

// Helpers
const mockStatus = jest.fn().mockReturnThis();
const mockJson = jest.fn();
const mockSend = jest.fn();

describe('Movie Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    jest.clearAllMocks();
  });

  const validMovie = {
    movieId: 'uuid-movie-123',
    title: 'Inception',
    description: 'Dream inside a dream.',
    ageRating: '13+',
    genre: 'Sci-Fi',
    releaseDate: new Date('2010-07-16'),
    director: 'Christopher Nolan',
    durationMinutes: 148,
  };

  describe('handleCreateMovie', () => {
    it('should create a movie successfully', async () => {
      (
        MockMovieService.prototype.createMovie as jest.Mock
      ).mockResolvedValueOnce(validMovie);

      await movieController.handleCreateMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movie successfully created',
        data: validMovie,
      });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.createMovie as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleCreateMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('handleGetMovieById', () => {
    it('should return movie if found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.getMovieById as jest.Mock
      ).mockResolvedValueOnce(validMovie);

      await movieController.handleGetMovieById(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movie found',
        data: validMovie,
      });
    });

    it('should return 404 if movie not found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.getMovieById as jest.Mock
      ).mockResolvedValueOnce(null);

      await movieController.handleGetMovieById(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.getMovieById as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleGetMovieById(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('handleGetAllMovies', () => {
    it('should return all movies', async () => {
      (
        MockMovieService.prototype.getAllMovies as jest.Mock
      ).mockResolvedValueOnce([validMovie]);

      await movieController.handleGetAllMovies(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movies list successfully retrieved',
        data: [validMovie],
      });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.getAllMovies as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleGetAllMovies(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('handleUpdateMovie', () => {
    it('should update movie successfully', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      req.body = { title: 'Updated Title' };
      (
        MockMovieService.prototype.updateMovie as jest.Mock
      ).mockResolvedValueOnce({ ...validMovie, title: 'Updated Title' });

      await movieController.handleUpdateMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movie successfully updated',
        data: { ...validMovie, title: 'Updated Title' },
      });
    });

    it('should return 404 if movie not found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.updateMovie as jest.Mock
      ).mockResolvedValueOnce(null);

      await movieController.handleUpdateMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.updateMovie as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleUpdateMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('handleDeleteMovie', () => {
    it('should delete movie successfully', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockResolvedValueOnce(true);

      await movieController.handleDeleteMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 404 if movie not found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockResolvedValueOnce(false);

      await movieController.handleDeleteMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleDeleteMovie(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('handleSearchMovies', () => {
    it('should return search results', async () => {
      req.query = { title: 'Inception' };
      (
        MockMovieService.prototype.searchMovies as jest.Mock
      ).mockResolvedValueOnce([validMovie]);

      await movieController.handleSearchMovies(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Search results successfully retrieved',
        data: [validMovie],
      });
    });

    it('should handle service error', async () => {
      (
        MockMovieService.prototype.searchMovies as jest.Mock
      ).mockRejectedValueOnce(new Error());

      await movieController.handleSearchMovies(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalled();
    });
  });
});
