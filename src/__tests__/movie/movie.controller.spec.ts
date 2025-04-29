// src/__tests__/movie/movie.routes.spec.ts

// Mock controllers before imports
jest.mock('../../controllers/movie.controller', () => ({
  handleCreateMovie: jest.fn((req, res) =>
    res.status(201).json({ message: 'created' })
  ),
  handleGetMovieById: jest.fn((req, res) =>
    res.status(200).json({ message: 'found' })
  ),
  handleGetAllMovies: jest.fn((req, res) =>
    res.status(200).json({ message: 'list' })
  ),
  handleUpdateMovie: jest.fn((req, res) =>
    res.status(200).json({ message: 'updated' })
  ),
  handleDeleteMovie: jest.fn((req, res) => res.status(204).send()),
  handleSearchMovies: jest.fn((req, res) =>
    res.status(200).json({ message: 'search' })
  ),
}));

jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
  },
}));

// Import after mocks
import express, { Express } from 'express';
import request from 'supertest';
import movieRouter from '../../routes/movie.routes';
import * as movieController from '../../controllers/movie.controller';

describe('Movie Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/movies', movieRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /movies', () => {
    it('should call handleCreateMovie controller', async () => {
      const response = await request(app).post('/movies').send({
        title: 'Movie Title',
        description: 'Description',
        ageRating: '13+',
        genre: 'Action',
        releaseDate: '2024-01-01',
        director: 'Some Director',
        durationMinutes: 120,
      });

      expect(movieController.handleCreateMovie).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'created' });
    });
  });

  describe('GET /movies/:movieId', () => {
    it('should call handleGetMovieById controller', async () => {
      const response = await request(app).get('/movies/movie123');

      expect(movieController.handleGetMovieById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'found' });
    });
  });

  describe('GET /movies', () => {
    it('should call handleGetAllMovies controller', async () => {
      const response = await request(app).get('/movies');

      expect(movieController.handleGetAllMovies).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'list' });
    });
  });

  describe('PUT /movies/:movieId', () => {
    it('should call handleUpdateMovie controller', async () => {
      const response = await request(app).put('/movies/movie123').send({
        title: 'Updated Movie',
      });

      expect(movieController.handleUpdateMovie).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'updated' });
    });
  });

  describe('DELETE /movies/:movieId', () => {
    it('should call handleDeleteMovie controller', async () => {
      const response = await request(app).delete('/movies/movie123');

      expect(movieController.handleDeleteMovie).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });
  });

  describe('GET /movies/search', () => {
    it('should call handleSearchMovies controller', async () => {
      const response = await request(app).get('/movies/search?title=Inception');

      expect(movieController.handleSearchMovies).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'search' });
    });
  });
});
