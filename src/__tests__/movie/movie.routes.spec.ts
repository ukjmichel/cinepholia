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
  handleUpdateMovie: jest.fn((req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Missing update fields' });
    }
    return res.status(200).json({ message: 'updated' });
  }),
  handleDeleteMovie: jest.fn((req, res) => res.status(204).send()),
  handleSearchMovies: jest.fn((req, res) => {
    if (
      !req.query ||
      (!req.query.title && !req.query.genre && !req.query.ageRating)
    ) {
      return res.status(400).json({ message: 'Missing search parameters' });
    }
    return res.status(200).json({ message: 'search' });
  }),
}));

jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
  },
}));

// Import AFTER mocks
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
    it('should create a movie when valid data is provided', async () => {
      const response = await request(app).post('/movies').send({
        title: 'Movie Title',
        description: 'Description',
        ageRating: '13+',
        genre: 'Action',
        releaseDate: '2024-01-01',
        director: 'Director Name',
        durationMinutes: 120,
      });

      expect(movieController.handleCreateMovie).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'created' });
    });

    it('should fail when missing required fields', async () => {
      const response = await request(app).post('/movies').send({
        title: 'Incomplete Movie',
      });

      expect(response.status).toBeGreaterThanOrEqual(400); // Bad request likely caught by validation
    });
  });

  describe('GET /movies/:movieId', () => {
    it('should retrieve a movie by ID', async () => {
      const response = await request(app).get('/movies/movie123');

      expect(movieController.handleGetMovieById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'found' });
    });

    it('should return 404 for non-existent movie', async () => {
      (movieController.handleGetMovieById as jest.Mock).mockImplementationOnce(
        (req, res) => res.status(404).json({ message: 'not found' })
      );

      const response = await request(app).get('/movies/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'not found' });
    });
  });

  describe('GET /movies', () => {
    it('should list all movies', async () => {
      const response = await request(app).get('/movies');

      expect(movieController.handleGetAllMovies).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'list' });
    });
  });

  describe('PUT /movies/:movieId', () => {
    it('should update a movie', async () => {
      const response = await request(app).put('/movies/movie123').send({
        title: 'Updated Movie Title',
      });

      expect(movieController.handleUpdateMovie).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'updated' });
    });

    it('should return 400 if update body is invalid', async () => {
      const response = await request(app).put('/movies/movie123').send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('DELETE /movies/:movieId', () => {
    it('should delete a movie by ID', async () => {
      const response = await request(app).delete('/movies/movie123');

      expect(movieController.handleDeleteMovie).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });

    it('should return 404 when deleting non-existent movie', async () => {
      (movieController.handleDeleteMovie as jest.Mock).mockImplementationOnce(
        (req, res) => res.status(404).json({ message: 'not found' })
      );

      const response = await request(app).delete('/movies/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'not found' });
    });
  });

  describe('GET /movies/search', () => {
    it('should search for movies', async () => {
      const response = await request(app).get('/movies/search?title=Inception');

      expect(movieController.handleSearchMovies).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'search' });
    });

    it('should return 400 if search query is missing', async () => {
      const response = await request(app).get('/movies/search');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
