import express, { Express } from 'express';
import request from 'supertest';
import screeningRoutes from '../../routes/screening.routes';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

// Mock middlewares: authenticateJwt + Permission.authorize
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
  },
}));

describe('Screening Routes', () => {
  let app: Express;
  let sequelize: Sequelize;
  let testScreeningId: string;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [ScreeningModel, MovieModel, MovieTheaterModel, MovieHallModel],
    });

    await sequelize.sync({ force: true });

    app = express();
    app.use(express.json());
    app.use('/screenings', screeningRoutes);
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    // Clear all tables
    await ScreeningModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieTheaterModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });

    // Create prerequisite data
    await MovieModel.create({
      movieId: 'movie123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      ageRating: '13+',
      genre: 'Sci-Fi',
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      durationMinutes: 148,
    });

    await MovieTheaterModel.create({
      theaterId: 'theater123',
      address: '123 Main Street',
      postalCode: '75000',
      city: 'Paris',
      phone: '0102030405',
      email: 'theater@example.com',
    });

    await MovieHallModel.create({
      hallId: 'hall123',
      theaterId: 'theater123',
      seatsLayout: [
        [1, 2, 3, "", 4, 5],
        [6, 7, 8, "", 9, 10],
      ],
    });

    // Create a test screening
    testScreeningId = uuidv4();
    await ScreeningModel.create({
      screeningId: testScreeningId,
      movieId: 'movie123',
      theaterId: 'theater123',
      hallId: 'hall123',
      startTime: new Date('2025-01-01T18:00:00Z'),
      durationTime: new Date('1970-01-01T02:30:00Z'),
    });
  });

  describe('POST /screenings', () => {
    it('should create a new screening', async () => {
      const screeningData = {
        movieId: 'movie123',
        theaterId: 'theater123',
        hallId: 'hall123',
        startTime: '2025-01-02T19:00:00Z',
        durationTime: '1970-01-01T02:00:00Z',
      };

      const res = await request(app).post('/screenings').send(screeningData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('movieId', 'movie123');
      expect(res.body).toHaveProperty('theaterId', 'theater123');
      expect(res.body).toHaveProperty('hallId', 'hall123');
    });
  });

  describe('GET /screenings', () => {
    it('should retrieve all screenings', async () => {
      const res = await request(app).get('/screenings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /screenings/:screeningId', () => {
    it('should retrieve a specific screening', async () => {
      const res = await request(app).get(`/screenings/${testScreeningId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('screeningId', testScreeningId);
      expect(res.body).toHaveProperty('movieId', 'movie123');
    });

    it('should return 404 if screening not found', async () => {
      const res = await request(app).get('/screenings/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /screenings/:screeningId', () => {
    it('should update a screening', async () => {
      const updateData = {
        startTime: '2025-01-10T17:30:00Z',
        durationTime: '1970-01-01T03:00:00Z',
      };

      const res = await request(app)
        .put(`/screenings/${testScreeningId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('screeningId', testScreeningId);

      // Format the dates for comparison
      const startTimeInResponse = new Date(res.body.startTime).toISOString();
      expect(startTimeInResponse).toBe(
        new Date(updateData.startTime).toISOString()
      );
    });

    it('should return 404 if screening not found when updating', async () => {
      const res = await request(app).put('/screenings/nonexistent-id').send({
        startTime: '2025-01-10T17:30:00Z',
      });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /screenings/:screeningId', () => {
    it('should delete a screening', async () => {
      const res = await request(app).delete(`/screenings/${testScreeningId}`);

      expect(res.status).toBe(204);

      // Verify screening was deleted
      const checkDeleted = await ScreeningModel.findByPk(testScreeningId);
      expect(checkDeleted).toBeNull();
    });

    it('should return 404 when deleting nonexistent screening', async () => {
      const res = await request(app).delete('/screenings/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });
});
