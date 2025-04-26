import express, { Express } from 'express';
import request from 'supertest';
import movieHallRoutes from '../../routes/movieHall.routes';
import { MovieHallModel } from '../../models/movieHall.model';
import { Sequelize } from 'sequelize-typescript';

// Mock middlewares: authenticateJwt + Permission.authorize
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
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
    if (sequelize) {
      await sequelize.close();
    }
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
          seatsLayout: [
            [1, 2, 3],
            [4, 5, 6],
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('theaterId', 'theater1');
      expect(res.body.data).toHaveProperty('hallId', 'hall1');
    });
  });

  describe('GET /movie-halls', () => {
    it('should retrieve all movie halls', async () => {
      await MovieHallModel.create({
        theaterId: 'theater2',
        hallId: 'hall2',
        seatsLayout: [
          [1, 2],
          [3, 4],
        ],
      });

      const res = await request(app).get('/movie-halls');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /movie-halls/:theaterId/:hallId', () => {
    it('should retrieve a specific movie hall', async () => {
      await MovieHallModel.create({
        theaterId: 'theater3',
        hallId: 'hall3',
        seatsLayout: [[5, 6, 7]],
      });

      const res = await request(app).get('/movie-halls/theater3/hall3');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('theaterId', 'theater3');
      expect(res.body.data).toHaveProperty('hallId', 'hall3');
    });

    it('should return 404 if movie hall not found', async () => {
      const res = await request(app).get(
        '/movie-halls/unknownTheater/unknownHall'
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Movie hall not found');
    });
  });

  describe('PUT /movie-halls/:theaterId/:hallId', () => {
    it('should update seats layout', async () => {
      await MovieHallModel.create({
        theaterId: 'theater4',
        hallId: 'hall4',
        seatsLayout: [[1, 2]],
      });

      const res = await request(app)
        .put('/movie-halls/theater4/hall4')
        .send({
          seatsLayout: [[7, 8, 9]],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.seatsLayout).toEqual([[7, 8, 9]]);
    });

    it('should return 404 if movie hall not found when updating', async () => {
      const res = await request(app)
        .put('/movie-halls/unknownTheater/unknownHall')
        .send({
          seatsLayout: [[7, 8, 9]],
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Movie hall not found');
    });
  });

  describe('DELETE /movie-halls/:theaterId/:hallId', () => {
    it('should delete a movie hall', async () => {
      await MovieHallModel.create({
        theaterId: 'theater5',
        hallId: 'hall5',
        seatsLayout: [[1, 2]],
      });

      const res = await request(app).delete('/movie-halls/theater5/hall5');

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting unknown hall', async () => {
      const res = await request(app).delete(
        '/movie-halls/unknownTheater/unknownHall'
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Movie hall not found');
    });
  });
});
