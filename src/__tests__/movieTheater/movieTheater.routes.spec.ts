// Mock controllers 
jest.mock('../../controllers/movieTheater.controller', () => ({
  createMovieTheater: jest.fn((req, res, next) =>
    res.status(201).json({ message: 'created' })
  ),
  getMovieTheaterById: jest.fn((req, res, next) =>
    res.status(200).json({ message: 'found' })
  ),
  getAllMovieTheaters: jest.fn((req, res, next) =>
    res.status(200).json({ message: 'list' })
  ),
  updateMovieTheater: jest.fn((req, res, next) =>
    res.status(200).json({ message: 'updated' })
  ),
  deleteMovieTheater: jest.fn((req, res, next) => res.status(204).send()),
}));

// Mock auth middlewares
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
  },
}));

// Mock validators (optional: they are just arrays of checks)
jest.mock('../../validators/movieTheater.validator', () => ({
  createMovieTheaterValidator: [(req: any, res: any, next: any) => next()],
  updateMovieTheaterValidator: [(req: any, res: any, next: any) => next()],
}));

// Mock handleValidationErrors
jest.mock('../../middlewares/handleValidationErrors.middleware', () => ({
  __esModule: true,
  default: (req: any, res: any, next: any) => next(),
}));

// Import after mocks
import express, { Express } from 'express';
import request from 'supertest';
const movieTheaterRouter = require('../../routes/movieTheater.routes').default;

describe('MovieTheater Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/movie-theaters', movieTheaterRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /movie-theaters', () => {
    it('should return 201 Created', async () => {
      const response = await request(app).post('/movie-theaters').send({});
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'created' });
    });
  });

  describe('GET /movie-theaters/:theaterId', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/movie-theaters/theater123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'found' });
    });
  });

  describe('GET /movie-theaters', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/movie-theaters');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'list' });
    });
  });

  describe('PUT /movie-theaters/:theaterId', () => {
    it('should return 200 OK', async () => {
      const response = await request(app)
        .put('/movie-theaters/theater123')
        .send({});
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'updated' });
    });
  });

  describe('DELETE /movie-theaters/:theaterId', () => {
    it('should return 204 No Content', async () => {
      const response = await request(app).delete('/movie-theaters/theater123');
      expect(response.status).toBe(204);
    });
  });
});
