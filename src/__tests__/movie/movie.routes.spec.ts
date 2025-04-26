// Mock controllers before imports
jest.mock('../../controllers/movie.controller', () => ({
  createMovie: jest.fn((req, res) =>
    res.status(201).json({ message: 'created' })
  ),
  getMovieById: jest.fn((req, res) =>
    res.status(200).json({ message: 'found' })
  ),
  getAllMovies: jest.fn((req, res) =>
    res.status(200).json({ message: 'list' })
  ),
  updateMovie: jest.fn((req, res) =>
    res.status(200).json({ message: 'updated' })
  ),
  deleteMovie: jest.fn((req, res) => res.status(204).send()),
}));

// Mock authentication and permissions
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
    it('should call createMovie controller', async () => {
      const response = await request(app).post('/movies').send({
        name: 'Movie Title',
        description: 'Description',
        age: '13+',
        genre: 'Action',
        date: '2024-01-01',
      });

      expect(movieController.createMovie).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'created' });
    });
  });

  describe('GET /movies/:movieId', () => {
    it('should call getMovieById controller', async () => {
      const response = await request(app).get('/movies/movie123');

      expect(movieController.getMovieById).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'found' });
    });
  });

  describe('GET /movies', () => {
    it('should call getAllMovies controller', async () => {
      const response = await request(app).get('/movies');

      expect(movieController.getAllMovies).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'list' });
    });
  });

  describe('PUT /movies/:movieId', () => {
    it('should call updateMovie controller', async () => {
      const response = await request(app).put('/movies/movie123').send({
        name: 'Updated Movie',
      });

      expect(movieController.updateMovie).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'updated' });
    });
  });

  describe('DELETE /movies/:movieId', () => {
    it('should call deleteMovie controller', async () => {
      const response = await request(app).delete('/movies/movie123');

      expect(movieController.deleteMovie).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });
  });
});
