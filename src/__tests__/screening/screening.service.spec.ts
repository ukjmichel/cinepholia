import { ScreeningService } from '../../services/screening.service';
import {
  ScreeningModel,
  ScreeningAttributes,
} from '../../models/screening.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../../errors/NotFoundError';
import { BadRequestError } from '../../errors/BadRequestError';
import {
  resetTables,
  seedScreeningDependencies,
  setupInMemoryDatabase,
} from '../../utils/setupTestDb';

describe('ScreeningService', () => {
  let sequelize: Sequelize;
  let screeningService: ScreeningService;
  let testScreeningId: string;
  let movieId: string;
  let theaterId: string;
  let hallId: string;

  beforeAll(async () => {
    sequelize = await setupInMemoryDatabase();
    screeningService = new ScreeningService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await resetTables();
    const seed = await seedScreeningDependencies();
    testScreeningId = seed.screeningId;
    movieId = seed.movieId;
    theaterId = seed.theaterId;
    hallId = seed.hallId;
  });

  describe('createScreening', () => {
    it('should create a new screening', async () => {
      const screeningData: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId,
        startTime: new Date('2025-01-02T19:00:00Z'),
        durationTime: '02:00:00',
      };

      const result = await screeningService.createScreening(screeningData);

      expect(result).toBeDefined();
      expect(result.movieId).toBe(movieId);
      expect(result.durationTime).toBe('02:00:00');
    });

    it('should autocorrect duration format', async () => {
      const screeningData: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId,
        startTime: new Date('2025-01-02T19:00:00Z'),
        durationTime: '2:5:0',
      };

      const result = await screeningService.createScreening(screeningData);

      expect(result.durationTime).toBe('02:05:00');
    });

    it('should throw BadRequestError if invalid duration format', async () => {
      const screeningData: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId,
        startTime: new Date('2025-01-02T19:00:00Z'),
        durationTime: '25:00:00',
      };

      await expect(
        screeningService.createScreening(screeningData)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if screening time conflicts', async () => {
      const conflictingScreening: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId,
        startTime: new Date('2025-01-01T19:00:00Z'),
        durationTime: '01:00:00',
      };

      await expect(
        screeningService.createScreening(conflictingScreening)
      ).rejects.toThrow(BadRequestError);
    });

    it('should allow non-conflicting screening same day', async () => {
      const nonConflictingScreening: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId,
        startTime: new Date('2025-01-01T21:00:00Z'),
        durationTime: '01:30:00',
      };

      const result = await screeningService.createScreening(
        nonConflictingScreening
      );

      expect(result).toBeDefined();
      expect(result.startTime.toISOString()).toBe('2025-01-01T21:00:00.000Z');
    });

    it('should throw NotFoundError if movie does not exist', async () => {
      const data: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId: 'non-existent-movie',
        theaterId,
        hallId,
        startTime: new Date(),
        durationTime: '02:00:00',
      };

      await expect(screeningService.createScreening(data)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError if theater does not exist', async () => {
      const data: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId: 'non-existent-theater',
        hallId,
        startTime: new Date(),
        durationTime: '02:00:00',
      };

      await expect(screeningService.createScreening(data)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw NotFoundError if hall does not exist', async () => {
      const data: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId,
        theaterId,
        hallId: 'non-existent-hall',
        startTime: new Date(),
        durationTime: '02:00:00',
      };

      await expect(screeningService.createScreening(data)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getScreeningById', () => {
    it('should return a screening when found', async () => {
      const result = await screeningService.getScreeningById(testScreeningId);

      expect(result).not.toBeNull();
      expect(result!.screeningId).toBe(testScreeningId);
    });

    it('should throw NotFoundError when screening not found', async () => {
      await expect(
        screeningService.getScreeningById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllScreenings', () => {
    it('should return all screenings', async () => {
      const results = await screeningService.getAllScreenings();

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0]).toBeInstanceOf(ScreeningModel);
    });
  });

  describe('updateScreening', () => {
    it('should update a screening', async () => {
      const newStartTime = new Date('2025-01-10T17:30:00Z');

      const updated = await screeningService.updateScreening(testScreeningId, {
        startTime: newStartTime,
      });

      expect(updated).not.toBeNull();
      expect(updated!.startTime.toISOString()).toBe(newStartTime.toISOString());
    });

    it('should throw NotFoundError if screening does not exist', async () => {
      await expect(
        screeningService.updateScreening('non-existent-id', {
          startTime: new Date(),
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should autocorrect durationTime if updating it', async () => {
      const updated = await screeningService.updateScreening(testScreeningId, {
        durationTime: '3:5:0',
      });

      expect(updated).not.toBeNull();
      expect(updated!.durationTime).toBe('03:05:00');
    });

    it('should throw BadRequestError if updating with invalid duration', async () => {
      await expect(
        screeningService.updateScreening(testScreeningId, {
          durationTime: '26:00:00',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteScreening', () => {
    it('should delete a screening', async () => {
      await expect(
        screeningService.deleteScreening(testScreeningId)
      ).resolves.not.toThrow();

      const deleted = await ScreeningModel.findByPk(testScreeningId);
      expect(deleted).toBeNull();
    });

    it('should throw NotFoundError if screening does not exist', async () => {
      await expect(
        screeningService.deleteScreening('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getScreeningsByTheaterAndMovieId', () => {
    it('should find screenings by theater and movie', async () => {
      const results = await screeningService.getScreeningsByTheaterAndMovieId(
        theaterId,
        movieId
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].theaterId).toBe(theaterId);
      expect(results[0].movieId).toBe(movieId);
    });

    it('should return empty array when no screenings found', async () => {
      const results = await screeningService.getScreeningsByTheaterAndMovieId(
        'unknown-theater',
        'unknown-movie'
      );

      expect(results).toEqual([]);
    });
  });

  describe('getScreeningsByMovieId', () => {
    it('should return screenings for a given movie', async () => {
      const results = await screeningService.getScreeningsByMovieId(movieId);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].movieId).toBe(movieId);
    });
  });

  describe('getScreeningsByTheaterId', () => {
    it('should return screenings for a given theater', async () => {
      const results =
        await screeningService.getScreeningsByTheaterId(theaterId);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].theaterId).toBe(theaterId);
    });
  });
});
