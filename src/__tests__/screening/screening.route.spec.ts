import express, { Express } from 'express';
import request from 'supertest';
import screeningRoutes from '../../routes/screening.routes';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

// Mock auth middlewares
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
  let secondScreeningId: string;
  let movieId1: string;
  let movieId2: string;
  let theaterId1: string;
  let theaterId2: string;
  let hallId1: string;
  let hallId2: string;

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
    await ScreeningModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieTheaterModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });

    movieId1 = uuidv4();
    movieId2 = uuidv4();
    theaterId1 = uuidv4();
    theaterId2 = uuidv4();
    hallId1 = uuidv4();
    hallId2 = uuidv4();

    await MovieModel.bulkCreate([
      {
        movieId: movieId1,
        title: 'Inception',
        description: 'A mind-bending thriller',
        ageRating: '13+',
        genre: 'Sci-Fi',
        releaseDate: new Date('2010-07-16'),
        director: 'Christopher Nolan',
        durationTime: "02:00:00",
      },
      {
        movieId: movieId2,
        title: 'The Dark Knight',
        description: 'Batman fights the Joker',
        ageRating: '13+',
        genre: 'Action',
        releaseDate: new Date('2008-07-18'),
        director: 'Christopher Nolan',
        durationTime: "02:30:00",
      },
    ]);

    await MovieTheaterModel.bulkCreate([
      {
        theaterId: theaterId1,
        address: '123 Main Street',
        postalCode: '75000',
        city: 'Paris',
        phone: '0102030405',
        email: 'theater@example.com',
      },
      {
        theaterId: theaterId2,
        address: '456 Elm Street',
        postalCode: '75001',
        city: 'Paris',
        phone: '0102030406',
        email: 'theater2@example.com',
      },
    ]);

    await MovieHallModel.bulkCreate([
      {
        hallId: hallId1,
        theaterId: theaterId1,
        seatsLayout: [
          [1, 2, 3, '', 4, 5],
          [6, 7, 8, '', 9, 10],
        ],
      },
      {
        hallId: hallId2,
        theaterId: theaterId2,
        seatsLayout: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
        ],
      },
    ]);

    testScreeningId = uuidv4();
    secondScreeningId = uuidv4();

    await ScreeningModel.bulkCreate([
      {
        screeningId: testScreeningId,
        movieId: movieId1,
        theaterId: theaterId1,
        hallId: hallId1,
        startTime: new Date('2025-01-01T18:00:00Z'),
        durationTime: '02:30:00',
      },
      {
        screeningId: secondScreeningId,
        movieId: movieId2,
        theaterId: theaterId1,
        hallId: hallId1,
        startTime: new Date('2025-01-01T21:00:00Z'),
        durationTime: '02:30:00',
      },
      {
        screeningId: uuidv4(),
        movieId: movieId1,
        theaterId: theaterId2,
        hallId: hallId2,
        startTime: new Date('2025-01-02T19:00:00Z'),
        durationTime: '02:30:00',
      },
    ]);
  });

  describe('POST /screenings', () => {
    it('should create a new screening', async () => {
      const screeningData = {
        movieId: movieId1,
        theaterId: theaterId1,
        hallId: hallId1,
        startTime: '2025-01-02T19:00:00Z',
        durationTime: '02:00:00',
      };

      const res = await request(app).post('/screenings').send(screeningData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('movieId', movieId1);
      expect(res.body.data).toHaveProperty('theaterId', theaterId1);
      expect(res.body.data).toHaveProperty('hallId', hallId1);
    });
  });

  describe('GET /screenings', () => {
    it('should retrieve all screenings', async () => {
      const res = await request(app).get('/screenings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /screenings/search', () => {
    it('should retrieve screenings by theater and movie IDs', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ theaterId: theaterId1, movieId: movieId1 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].movieId).toBe(movieId1);
      expect(res.body.data[0].theaterId).toBe(theaterId1);
    });

    it('should return empty array when no screenings match', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ theaterId: theaterId2, movieId: movieId2 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should return 400 if theaterId is missing', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ movieId: movieId1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 if movieId is missing', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ theaterId: theaterId1 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /screenings/:screeningId', () => {
    it('should retrieve a specific screening', async () => {
      const res = await request(app).get(`/screenings/${testScreeningId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('screeningId', testScreeningId);
    });
  });

  describe('PUT /screenings/:screeningId', () => {
    it('should update a screening', async () => {
      const updateData = {
        startTime: '2025-01-10T17:30:00Z',
        durationTime: '03:00:00',
      };

      const res = await request(app)
        .put(`/screenings/${testScreeningId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('screeningId', testScreeningId);
    });
  });

  describe('DELETE /screenings/:screeningId', () => {
    it('should delete a screening', async () => {
      const res = await request(app).delete(`/screenings/${testScreeningId}`);
      expect(res.status).toBe(204);

      const checkDeleted = await ScreeningModel.findByPk(testScreeningId);
      expect(checkDeleted).toBeNull();
    });
  });
});
