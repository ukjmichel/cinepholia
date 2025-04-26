import express, { Express } from 'express';
import request from 'supertest';
import movieTheaterRouter from '../../routes/movieTheater.routes';
import * as movieTheaterController from '../../controllers/movieTheater.controller';

// Mock all controller functions
jest.mock('../../controllers/movieTheater.controller');

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
    it('should call createMovietheater controller', async () => {
      const createMovietheaterMock =
        movieTheaterController.createMovietheater as jest.Mock;
      createMovietheaterMock.mockImplementation((req, res) =>
        res.status(201).json({})
      );

      const response = await request(app).post('/movie-theaters').send({});

      expect(createMovietheaterMock).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('GET /movie-theaters/:theaterId', () => {
    it('should call getMovietheaterById controller', async () => {
      const getMovietheaterByIdMock =
        movieTheaterController.getMovietheaterById as jest.Mock;
      getMovietheaterByIdMock.mockImplementation((req, res) =>
        res.status(200).json({})
      );

      const response = await request(app).get('/movie-theaters/theater123');

      expect(getMovietheaterByIdMock).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /movie-theaters', () => {
    it('should call getAllMovieTheaters controller', async () => {
      const getAllMovieTheatersMock =
        movieTheaterController.getAllMovieTheaters as jest.Mock;
      getAllMovieTheatersMock.mockImplementation((req, res) =>
        res.status(200).json({})
      );

      const response = await request(app).get('/movie-theaters');

      expect(getAllMovieTheatersMock).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /movie-theaters/:theaterId', () => {
    it('should call updateMovietheater controller', async () => {
      const updateMovietheaterMock =
        movieTheaterController.updateMovietheater as jest.Mock;
      updateMovietheaterMock.mockImplementation((req, res) =>
        res.status(200).json({})
      );

      const response = await request(app)
        .put('/movie-theaters/theater123')
        .send({});

      expect(updateMovietheaterMock).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /movie-theaters/:theaterId', () => {
    it('should call deleteMovietheater controller', async () => {
      const deleteMovietheaterMock =
        movieTheaterController.deleteMovietheater as jest.Mock;
      deleteMovietheaterMock.mockImplementation((req, res) =>
        res.status(204).send()
      );

      const response = await request(app).delete('/movie-theaters/theater123');

      expect(deleteMovietheaterMock).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });
  });
});
