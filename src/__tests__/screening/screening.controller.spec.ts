import request from 'supertest';
import express, { Express } from 'express';
import { Request, Response, NextFunction } from 'express';

import {
  handleCreateScreening,
  handleGetScreeningById,
  handleGetAllScreenings,
  handleUpdateScreening,
  handleDeleteScreening,
  handleSearchScreenings,
  screeningService,
} from '../../controllers/screening.controller';

import { ScreeningAttributes } from '../../models/screening.model';
import { ScreeningService } from '../../services/screening.service';

jest.mock('../../services/screening.service'); // <-- mock class!

const MockScreeningService = ScreeningService as jest.MockedClass<
  typeof ScreeningService
>;

describe('Screening Controller', () => {
  let app: Express;
  let mockService: ScreeningService;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    mockService = new MockScreeningService();

    // IMPORTANT: Define more specific routes first!
    // Fix: Move the search route before the :screeningId route
    app.get('/screenings/search', (req, res) =>
      handleSearchScreenings(req, res, {} as NextFunction)
    );

    // inject manually a version of handlers using mockService
    app.post('/screenings', (req, res) =>
      handleCreateScreening(req, res, {} as NextFunction)
    );
    app.get('/screenings', (req, res) =>
      handleGetAllScreenings(req, res, {} as NextFunction)
    );
    app.get('/screenings/:screeningId', (req, res) =>
      handleGetScreeningById(req, res, {} as NextFunction)
    );
    app.put('/screenings/:screeningId', (req, res) =>
      handleUpdateScreening(req, res, {} as NextFunction)
    );
    app.delete('/screenings/:screeningId', (req, res) =>
      handleDeleteScreening(req, res, {} as NextFunction)
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getScreeningByTheaterAndMovieId for the success test
    (
      mockService.getScreeningByTheaterAndMovieId as jest.Mock
    ).mockResolvedValue([screeningMock]);
  });

  const screeningMock: ScreeningAttributes = {
    screeningId: 'screening-uuid',
    movieId: 'movie-uuid',
    theaterId: 'theater-uuid',
    hallId: 'hall-uuid',
    startTime: new Date(),
    durationTime: new Date(),
  };

  describe('POST /screenings', () => {
    it('should create a screening', async () => {
      (screeningService.createScreening as jest.Mock).mockResolvedValue(
        screeningMock
      );

      const response = await request(app)
        .post('/screenings')
        .send(screeningMock);

      expect(response.status).toBe(201);
      expect(response.body.screeningId).toBe('screening-uuid');
    });

    it('should handle errors when creating a screening', async () => {
      (screeningService.createScreening as jest.Mock).mockRejectedValue(
        new Error('Create failed')
      );

      const response = await request(app)
        .post('/screenings')
        .send(screeningMock);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to create screening');
    });
  });

  describe('GET /screenings', () => {
    it('should get all screenings', async () => {
      (screeningService.getAllScreenings as jest.Mock).mockResolvedValue([
        screeningMock,
      ]);

      const response = await request(app).get('/screenings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle errors when getting all screenings', async () => {
      (screeningService.getAllScreenings as jest.Mock).mockRejectedValue(
        new Error('Fetch failed')
      );

      const response = await request(app).get('/screenings');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch screenings');
    });
  });

  describe('GET /screenings/:screeningId', () => {
    it('should get screening by ID', async () => {
      (screeningService.getScreeningById as jest.Mock).mockResolvedValue(
        screeningMock
      );

      const response = await request(app).get('/screenings/screening-uuid');

      expect(response.status).toBe(200);
      expect(response.body.screeningId).toBe('screening-uuid');
    });

    it('should return 404 if screening not found', async () => {
      (screeningService.getScreeningById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/screenings/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when getting screening by ID', async () => {
      (screeningService.getScreeningById as jest.Mock).mockRejectedValue(
        new Error('Fetch failed')
      );

      const response = await request(app).get('/screenings/screening-uuid');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch screening');
    });
  });

  describe('PUT /screenings/:screeningId', () => {
    it('should update a screening', async () => {
      (screeningService.updateScreening as jest.Mock).mockResolvedValue({
        ...screeningMock,
        durationTime: new Date(),
      });

      const response = await request(app)
        .put('/screenings/screening-uuid')
        .send({ durationTime: new Date() });

      expect(response.status).toBe(200);
      expect(response.body.screeningId).toBe('screening-uuid');
    });

    it('should return 404 if screening to update not found', async () => {
      (screeningService.updateScreening as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/screenings/unknown-id')
        .send({ durationTime: new Date() });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when updating a screening', async () => {
      (screeningService.updateScreening as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const response = await request(app)
        .put('/screenings/screening-uuid')
        .send({ durationTime: new Date() });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to update screening');
    });
  });

  describe('DELETE /screenings/:screeningId', () => {
    it('should delete a screening', async () => {
      (screeningService.deleteScreening as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete('/screenings/screening-uuid');

      expect(response.status).toBe(204);
    });

    it('should return 404 if screening to delete not found', async () => {
      (screeningService.deleteScreening as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete('/screenings/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when deleting a screening', async () => {
      (screeningService.deleteScreening as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      );

      const response = await request(app).delete('/screenings/screening-uuid');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete screening');
    });
  });

  describe('GET /screenings/search', () => {
    it('should return screenings when theaterId and movieId are provided', async () => {
      // Fix: Use screeningService here to match the actual implementation
      (
        screeningService.getScreeningByTheaterAndMovieId as jest.Mock
      ).mockResolvedValue([{ screeningId: 'screening-uuid' }]);

      const response = await request(app)
        .get('/screenings/search')
        .query({ theaterId: 'theater-uuid', movieId: 'movie-uuid' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].screeningId).toBe('screening-uuid');
    });

    it('should return 400 if theaterId or movieId is missing', async () => {
      const response = await request(app)
        .get('/screenings/search')
        .query({ theaterId: 'theater-uuid' }); // missing movieId

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Missing theaterId or movieId in query parameters'
      );
    });

    it('should handle errors when searching screenings', async () => {
      // Fix: Use screeningService here to match the actual implementation
      (
        screeningService.getScreeningByTheaterAndMovieId as jest.Mock
      ).mockRejectedValue(new Error('Fetch failed'));

      const response = await request(app)
        .get('/screenings/search')
        .query({ theaterId: 'theater-uuid', movieId: 'movie-uuid' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to search screenings');
      expect(response.body.detail).toBe('Fetch failed');
    });
  });
});
