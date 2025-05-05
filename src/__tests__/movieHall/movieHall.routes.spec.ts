import express, { Express } from 'express';
import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import movieHallRoutes from '../../routes/movieHall.routes';
import { MovieHallModel } from '../../models/movieHall.model';

// Mock auth middleware (pass through)
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => next(),
}));

// Mock authorization middleware (pass through)
jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize:
      () =>
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) =>
        next(),
  },
}));

describe('MovieHall Routes', () => {
  let app: Express;
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [MovieHallModel],
    });
    await sequelize.sync({ force: true });

    app = express();
    app.use(express.json());
    app.use('/movie-halls', movieHallRoutes);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('POST /movie-halls', () => {
    it('should create a movie hall', async () => {
      const res = await request(app)
        .post('/movie-halls')
        .send({
          theaterId: 'theater1',
          hallId: 'hall1',
          seatsLayout: [['1', '2', '3']],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('theaterId', 'theater1');
      expect(res.body.data).toHaveProperty('hallId', 'hall1');
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/movie-halls')
        .send({ theaterId: '', hallId: 123, seatsLayout: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for special characters in theaterId', async () => {
      const res = await request(app)
        .post('/movie-halls')
        .send({
          theaterId: 'theater@#$%',
          hallId: 'hall1',
          seatsLayout: [['1', '2', '3']],
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /movie-halls', () => {
    it('should retrieve all movie halls', async () => {
      await MovieHallModel.create({
        theaterId: 'theater2',
        hallId: 'hall2',
        seatsLayout: [['1', '2']],
      });

      const res = await request(app).get('/movie-halls');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /movie-halls/:theaterId/:hallId', () => {
    it('should retrieve a specific movie hall', async () => {
      await MovieHallModel.create({
        theaterId: 'theater3',
        hallId: 'hall3',
        seatsLayout: [['5', '6', '7']],
      });

      const res = await request(app).get('/movie-halls/theater3/hall3');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('theaterId', 'theater3');
      expect(res.body.data).toHaveProperty('hallId', 'hall3');
    });

    

    it('should return 400 for invalid params', async () => {
      const res = await request(app).get('/movie-halls/invalid%20id/hall1');

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('PUT /movie-halls/:theaterId/:hallId', () => {
    it('should update seats layout', async () => {
      await MovieHallModel.create({
        theaterId: 'theater4',
        hallId: 'hall4',
        seatsLayout: [['1', '2']],
      });

      const res = await request(app)
        .put('/movie-halls/theater4/hall4')
        .send({ seatsLayout: [['7', '8', '9']] });

      expect(res.status).toBe(200);
      expect(res.body.data.seatsLayout).toEqual([['7', '8', '9']]);
    });

    

    it('should return 400 for invalid update payload', async () => {
      const res = await request(app)
        .put('/movie-halls/theater4/hall4')
        .send({ seatsLayout: 'invalid-format' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('DELETE /movie-halls/:theaterId/:hallId', () => {
    it('should delete a movie hall', async () => {
      await MovieHallModel.create({
        theaterId: 'theater5',
        hallId: 'hall5',
        seatsLayout: [['1', '2']],
      });

      const res = await request(app).delete('/movie-halls/theater5/hall5');

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting unknown movie hall', async () => {
      const res = await request(app).delete(
        '/movie-halls/unknownTheater/unknownHall'
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toMatch(
        /Movie hall with theaterId unknownTheater and hallId unknownHall not found/
      );
    });

    it('should return 400 for invalid params', async () => {
      const res = await request(app).delete('/movie-halls/invalid%20id/hall1');

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Validation for MovieHall Routes', () => {
    describe('POST /movie-halls', () => {
      it('should return 400 if theaterId is missing', async () => {
        const res = await request(app)
          .post('/movie-halls')
          .send({
            hallId: 'hall1',
            seatsLayout: [['1', '2', '3']],
          });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(/theaterId is required/);
      });

      it('should return 400 if seatsLayout has invalid structure', async () => {
        const res = await request(app).post('/movie-halls').send({
          theaterId: 'theater1',
          hallId: 'hall1',
          seatsLayout: 'invalid-layout',
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(
          /seatsLayout must be a non-empty array/
        );
      });
    });

    describe('PUT /movie-halls/:theaterId/:hallId', () => {
      it('should return 400 if seatsLayout is not an array', async () => {
        const res = await request(app)
          .put('/movie-halls/theater1/hall1')
          .send({ seatsLayout: 'invalid-layout' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(
          /seatsLayout must be a non-empty array/
        );
      });

      it('should return 400 if theaterId param has special characters', async () => {
        const res = await request(app)
          .put('/movie-halls/theater@123/hall1')
          .send({ seatsLayout: [['1']] });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(
          /must contain only letters, numbers, and dashes/
        );
      });
    });

    describe('GET /movie-halls/:theaterId/:hallId', () => {
      it('should return 400 if theaterId param is invalid', async () => {
        const res = await request(app).get('/movie-halls/theater@123/hall1');

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(
          /must contain only letters, numbers, and dashes/
        );
      });
    });

    describe('DELETE /movie-halls/:theaterId/:hallId', () => {
      it('should return 400 if hallId param is invalid', async () => {
        const res = await request(app).delete('/movie-halls/theater1/hall@1');

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].msg).toMatch(
          /must contain only letters, numbers, and dashes/
        );
      });
    });
  });
});
