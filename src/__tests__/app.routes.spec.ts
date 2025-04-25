import request from 'supertest';
import express from 'express';
import appRouter from '../routes/app';
import { sequelize } from '../config/db'; // ✅ named import

jest.mock('../config/db', () => ({
  sequelize: {
    authenticate: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/', appRouter);

describe('GET /', () => {
  it('should return a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello, Express with TypeScript!');
  });
});

describe('GET /health/db', () => {
  it('should return 200 if DB connection is healthy', async () => {
    (sequelize.authenticate as jest.Mock).mockResolvedValueOnce(undefined);

    const res = await request(app).get('/health/db');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Database connection is healthy',
    });
  });

  it('should return 500 if DB connection fails', async () => {
    (sequelize.authenticate as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const res = await request(app).get('/health/db');

    expect(res.status).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Database connection failed');
    expect(res.body.error).toBeDefined();
  });
});
