import { ScreeningService } from '../../services/screening.service';
import {
  ScreeningModel,
  ScreeningAttributes,
} from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

describe('ScreeningService', () => {
  let sequelize: Sequelize;
  let screeningService: ScreeningService;
  let testScreeningId: string;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [ScreeningModel, MovieModel, MovieTheaterModel, MovieHallModel],
    });

    await sequelize.sync({ force: true });
    screeningService = new ScreeningService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear all data
    await ScreeningModel.destroy({ where: {} });
    await MovieModel.destroy({ where: {} });
    await MovieTheaterModel.destroy({ where: {} });
    await MovieHallModel.destroy({ where: {} });

    // Create prerequisite data
    await MovieModel.create({
      movieId: 'movie123',
      title: 'Inception', // 🔥 Correct: title (not name)
      description: 'A mind-bending thriller',
      ageRating: 'PG-13', // 🔥 Correct: ageRating (not age)
      genre: 'Sci-Fi',
      releaseDate: new Date('2010-07-16'), // 🔥 Correct: releaseDate (not date)
      director: 'Christopher Nolan', // 🔥 Required new fields
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
        [1, 2, 3, '', 4, 5],
        [6, 7, 8, '', 9, 10],
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

  describe('createScreening', () => {
    it('should create a new screening', async () => {
      const screeningData: ScreeningAttributes = {
        screeningId: uuidv4(),
        movieId: 'movie123',
        theaterId: 'theater123',
        hallId: 'hall123',
        startTime: new Date('2025-01-02T19:00:00Z'),
        durationTime: new Date('1970-01-01T02:00:00Z'),
      };

      const result = await screeningService.createScreening(screeningData);

      expect(result).toBeDefined();
      expect(result.screeningId).toBe(screeningData.screeningId);
      expect(result.movieId).toBe('movie123');
      expect(result.theaterId).toBe('theater123');
    });
  });

  describe('getScreeningById', () => {
    it('should return a screening when found', async () => {
      const result = await screeningService.getScreeningById(testScreeningId);

      expect(result).toBeDefined();
      expect(result?.screeningId).toBe(testScreeningId);
    });

    it('should return null when screening not found', async () => {
      const result = await screeningService.getScreeningById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllScreenings', () => {
    it('should return all screenings', async () => {
      // Add another screening
      await ScreeningModel.create({
        screeningId: uuidv4(),
        movieId: 'movie123',
        theaterId: 'theater123',
        hallId: 'hall123',
        startTime: new Date('2025-01-03T20:00:00Z'),
        durationTime: new Date('1970-01-01T02:15:00Z'),
      });

      const results = await screeningService.getAllScreenings();

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(ScreeningModel);
      expect(results[1]).toBeInstanceOf(ScreeningModel);
    });

    it('should return empty array when no screenings exist', async () => {
      await ScreeningModel.destroy({ where: {} });

      const results = await screeningService.getAllScreenings();

      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });
  });

  describe('updateScreening', () => {
    it('should update a screening when found', async () => {
      const updateData = {
        startTime: new Date('2025-01-10T17:30:00Z'),
        durationTime: new Date('1970-01-01T03:00:00Z'),
      };

      const result = await screeningService.updateScreening(
        testScreeningId,
        updateData
      );

      expect(result).toBeDefined();
      expect(result?.screeningId).toBe(testScreeningId);
      expect(result?.startTime.toISOString()).toBe(
        updateData.startTime.toISOString()
      );

      // Verify that the update was persisted
      const updated = await ScreeningModel.findByPk(testScreeningId);
      expect(updated?.startTime.toISOString()).toBe(
        updateData.startTime.toISOString()
      );
    });

    it('should return null when screening not found', async () => {
      const result = await screeningService.updateScreening('non-existent-id', {
        startTime: new Date(),
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteScreening', () => {
    it('should delete a screening when found', async () => {
      const result = await screeningService.deleteScreening(testScreeningId);

      expect(result).toBe(true);

      // Verify the screening was deleted
      const deleted = await ScreeningModel.findByPk(testScreeningId);
      expect(deleted).toBeNull();
    });

    it('should return false when screening not found', async () => {
      const result = await screeningService.deleteScreening('non-existent-id');

      expect(result).toBe(false);
    });
  });
  describe('getScreeningByTheaterAndMovieId', () => {
    it('should return screenings matching theaterId and movieId', async () => {
      // Act
      const results = await screeningService.getScreeningByTheaterAndMovieId(
        'theater123',
        'movie123'
      );

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toBeInstanceOf(ScreeningModel);
      expect(results[0].theaterId).toBe('theater123');
      expect(results[0].movieId).toBe('movie123');
    });

    it('should return empty array if no matching screenings found', async () => {
      // Act
      const results = await screeningService.getScreeningByTheaterAndMovieId(
        'non-existent-theater',
        'non-existent-movie'
      );

      // Assert
      expect(results).toEqual([]);
    });
  });
});
