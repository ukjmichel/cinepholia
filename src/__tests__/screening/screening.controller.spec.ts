// src/__tests__/screening/screening.controller.spec.ts

import request from 'supertest';
import express, { Express } from 'express';
import {
  handleCreateScreening,
  handleGetScreeningById,
  handleGetAllScreenings,
  handleUpdateScreening,
  handleDeleteScreening,
} from '../../controllers/screening.controller';

import { ScreeningService } from '../../services/screening.service';
import { ScreeningAttributes } from '../../models/screening.model';

// 🧪 Mock the service
jest.mock('../../services/screening.service');
const MockScreeningService = ScreeningService as jest.MockedClass<
  typeof ScreeningService
>;

describe('Screening Controller', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Attach routes manually for testing
    app.post('/screenings', handleCreateScreening);
    app.get('/screenings', handleGetAllScreenings);
    app.get('/screenings/:screeningId', handleGetScreeningById);
    app.put('/screenings/:screeningId', handleUpdateScreening);
    app.delete('/screenings/:screeningId', handleDeleteScreening);
  });

  beforeEach(() => {
    jest.clearAllMocks();
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
      (
        MockScreeningService.prototype.createScreening as jest.Mock
      ).mockResolvedValue(screeningMock);

      const response = await request(app)
        .post('/screenings')
        .send(screeningMock);

      expect(response.status).toBe(201);
      expect(response.body.screeningId).toBe('screening-uuid');
    });

    it('should handle errors when creating a screening', async () => {
      (
        MockScreeningService.prototype.createScreening as jest.Mock
      ).mockRejectedValue(new Error('Create failed'));

      const response = await request(app)
        .post('/screenings')
        .send(screeningMock);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to create screening');
    });
  });

  describe('GET /screenings', () => {
    it('should get all screenings', async () => {
      (
        MockScreeningService.prototype.getAllScreenings as jest.Mock
      ).mockResolvedValue([screeningMock]);

      const response = await request(app).get('/screenings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle errors when getting all screenings', async () => {
      (
        MockScreeningService.prototype.getAllScreenings as jest.Mock
      ).mockRejectedValue(new Error('Fetch failed'));

      const response = await request(app).get('/screenings');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch screenings');
    });
  });

  describe('GET /screenings/:screeningId', () => {
    it('should get screening by ID', async () => {
      (
        MockScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(screeningMock);

      const response = await request(app).get('/screenings/screening-uuid');

      expect(response.status).toBe(200);
      expect(response.body.screeningId).toBe('screening-uuid');
    });

    it('should return 404 if screening not found', async () => {
      (
        MockScreeningService.prototype.getScreeningById as jest.Mock
      ).mockResolvedValue(null);

      const response = await request(app).get('/screenings/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when getting screening by ID', async () => {
      (
        MockScreeningService.prototype.getScreeningById as jest.Mock
      ).mockRejectedValue(new Error('Fetch failed'));

      const response = await request(app).get('/screenings/screening-uuid');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch screening');
    });
  });

  describe('PUT /screenings/:screeningId', () => {
    it('should update a screening', async () => {
      (
        MockScreeningService.prototype.updateScreening as jest.Mock
      ).mockResolvedValue({
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
      (
        MockScreeningService.prototype.updateScreening as jest.Mock
      ).mockResolvedValue(null);

      const response = await request(app)
        .put('/screenings/unknown-id')
        .send({ durationTime: new Date() });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when updating a screening', async () => {
      (
        MockScreeningService.prototype.updateScreening as jest.Mock
      ).mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put('/screenings/screening-uuid')
        .send({ durationTime: new Date() });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to update screening');
    });
  });

  describe('DELETE /screenings/:screeningId', () => {
    it('should delete a screening', async () => {
      (
        MockScreeningService.prototype.deleteScreening as jest.Mock
      ).mockResolvedValue(true);

      const response = await request(app).delete('/screenings/screening-uuid');

      expect(response.status).toBe(204);
    });

    it('should return 404 if screening to delete not found', async () => {
      (
        MockScreeningService.prototype.deleteScreening as jest.Mock
      ).mockResolvedValue(false);

      const response = await request(app).delete('/screenings/unknown-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Screening with ID unknown-id not found'
      );
    });

    it('should handle errors when deleting a screening', async () => {
      (
        MockScreeningService.prototype.deleteScreening as jest.Mock
      ).mockRejectedValue(new Error('Delete failed'));

      const response = await request(app).delete('/screenings/screening-uuid');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete screening');
    });
  });
});
