import express, { Express } from 'express';
import request from 'supertest';
import movieRouter from '../../routes/movie.routes';

// Mock middlewares
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));
jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
  },
}));

// Mock controllers (you already had this style)
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

describe('Movie Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/movies', movieRouter);
  });

  it('should create a movie', async () => {
    const res = await request(app).post('/movies').send({
      title: 'Example',
      description: 'Example description',
      ageRating: '13+',
      genre: 'Action',
      releaseDate: '2024-01-01',
      director: 'John Doe',
      durationMinutes: 120,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('created');
  });

  it('should get movie by ID', async () => {
    const res = await request(app).get('/movies/movie123');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('found');
  });

  it('should list all movies', async () => {
    const res = await request(app).get('/movies');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('list');
  });

  it('should update a movie', async () => {
    const res = await request(app)
      .put('/movies/movie123')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('updated');
  });

  it('should delete a movie', async () => {
    const res = await request(app).delete('/movies/movie123');
    expect(res.status).toBe(204);
  });

  it('should search movies', async () => {
    const res = await request(app).get('/movies/search?title=Inception');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('search');
  });
});
