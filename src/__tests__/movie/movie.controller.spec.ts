// src/__tests__/movie/movie.controller.spec.ts
import { Request, Response, NextFunction } from 'express';
import * as movieController from '../../controllers/movie.controller';
import { MovieService } from '../../services/movie.service';

// Mock MovieService
jest.mock('../../services/movie.service');
const MockMovieService = MovieService as jest.MockedClass<typeof MovieService>;


describe('Movie Controller', () => {
  // Helpers
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockSend: jest.Mock;
  let mockNext: jest.Mock; // <<<<<< ADDED
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockNext = jest.fn(); // <<<<<< ADD THIS
    res = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
    jest.clearAllMocks();
    mockNext.mockClear(); // <<<<<< Add this
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

      await movieController.handleCreateMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movie successfully created',
        data: validMovie,
      });
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.createMovie as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleCreateMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleGetMovieById', () => {
    it('should return movie if found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.getMovieById as jest.Mock
      ).mockResolvedValueOnce(validMovie);

      await movieController.handleGetMovieById(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

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

      await movieController.handleGetMovieById(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.getMovieById as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleGetMovieById(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleGetAllMovies', () => {
    it('should return all movies', async () => {
      (
        MockMovieService.prototype.getAllMovies as jest.Mock
      ).mockResolvedValueOnce([validMovie]);

      await movieController.handleGetAllMovies(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Movies list successfully retrieved',
        data: [validMovie],
      });
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.getAllMovies as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleGetAllMovies(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleUpdateMovie', () => {
    it('should update movie successfully', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      req.body = { title: 'Updated Title' };
      (
        MockMovieService.prototype.updateMovie as jest.Mock
      ).mockResolvedValueOnce({ ...validMovie, title: 'Updated Title' });

      await movieController.handleUpdateMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

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

      await movieController.handleUpdateMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Movie not found' });
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.updateMovie as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleUpdateMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleDeleteMovie', () => {
    it('should delete movie successfully', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockResolvedValueOnce(true);

      await movieController.handleDeleteMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should call next(error) if movie not found', async () => {
      req.params = { movieId: 'uuid-movie-123' };
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockRejectedValueOnce(new Error('Not found'));

      await movieController.handleDeleteMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.deleteMovie as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleDeleteMovie(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('handleSearchMovies', () => {
    it('should return search results', async () => {
      req.query = { title: 'Inception' };
      (
        MockMovieService.prototype.searchMovies as jest.Mock
      ).mockResolvedValueOnce([validMovie]);

      await movieController.handleSearchMovies(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Search results successfully retrieved',
        data: [validMovie],
      });
    });

    it('should call next(error) on failure', async () => {
      (
        MockMovieService.prototype.searchMovies as jest.Mock
      ).mockRejectedValueOnce(new Error('Error'));

      await movieController.handleSearchMovies(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
