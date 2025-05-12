import express, { Express } from 'express';
import request from 'supertest';
import screeningRoutes from '../../routes/screening.routes';
import { ScreeningModel } from '../../models/screening.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import {
  setupInMemoryDatabase,
  seedScreeningDependencies,
  resetTables,
} from '../../utils/setupTestDb';

// Mock auth middlewares
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (_req: any, _res: any, next: any) => next(),
}));
jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (_req: any, _res: any, next: any) => next(),
  },
}));

describe('Screening Routes', () => {
  let app: Express;
  let sequelize: Sequelize;
  let testScreeningId: string;
  let movieId: string;
  let theaterId: string;
  let hallId: string;

  beforeAll(async () => {
    sequelize = await setupInMemoryDatabase();
    app = express();
    app.use(express.json());
    app.use('/screenings', screeningRoutes);
  });

  beforeEach(async () => {
    await resetTables();
    const deps = await seedScreeningDependencies();
    testScreeningId = deps.screeningId;
    movieId = deps.movieId;
    theaterId = deps.theaterId;
    hallId = deps.hallId;
  });

  afterAll(async () => {
    if (sequelize) await sequelize.close();
  });

  describe('POST /screenings', () => {
    it('should create a new screening', async () => {
      const res = await request(app).post('/screenings').send({
        movieId,
        theaterId,
        hallId,
        startTime: '2025-01-02T19:00:00Z',
        durationTime: '02:00:00',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('movieId', movieId);
    });
  });

  describe('GET /screenings', () => {
    it('should retrieve all screenings', async () => {
      const res = await request(app).get('/screenings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /screenings/search', () => {
    it('should retrieve screenings by theater and movie IDs', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ theaterId, movieId });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should return 400 if missing query params', async () => {
      const res = await request(app)
        .get('/screenings/search')
        .query({ movieId });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /screenings/:screeningId', () => {
    it('should retrieve a specific screening', async () => {
      const res = await request(app).get(`/screenings/${testScreeningId}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('screeningId', testScreeningId);
    });
  });

  describe('PATCH /screenings/:screeningId', () => {
    it('should update a screening', async () => {
      const res = await request(app)
        .patch(`/screenings/${testScreeningId}`)
        .send({ startTime: '2025-01-10T17:30:00Z', durationTime: '03:00:00' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('screeningId', testScreeningId);
    });
  });

  describe('DELETE /screenings/:screeningId', () => {
    it('should delete a screening', async () => {
      const res = await request(app).delete(`/screenings/${testScreeningId}`);
      expect(res.status).toBe(204);

      const check = await ScreeningModel.findByPk(testScreeningId);
      expect(check).toBeNull();
    });
  });
});
