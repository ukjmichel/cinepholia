import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import { CommentService } from '../../services/comment.service';
import { CommentModel } from '../../models/comment.model';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

import { NotFoundError } from '../../errors/NotFoundError';
import { BadRequestError } from '../../errors/BadRequestError';
import { ConflictError } from '../../errors/ConflictError';

describe('CommentService', () => {
  let mongo: MongoMemoryServer;
  let sequelize: Sequelize;
  let service: CommentService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [
        BookingModel,
        UserModel,
        ScreeningModel,
        MovieModel,
        MovieTheaterModel,
        MovieHallModel,
      ],
    });

    await sequelize.sync({ force: true });
    service = new CommentService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    await sequelize.close();
  });

  beforeEach(async () => {
    await CommentModel.deleteMany({});
    await BookingModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
    await ScreeningModel.destroy({ where: {} });
    await MovieModel.destroy({ where: {} });
    await MovieTheaterModel.destroy({ where: {} });
    await MovieHallModel.destroy({ where: {} });
  });

  const createBooking = async () => {
    const userId = uuidv4();
    const movieId = uuidv4();
    const theaterId = 'theater123';
    const hallId = 'hall123';
    const screeningId = uuidv4();
    const bookingId = uuidv4();

    await UserModel.create({
      id: userId,
      name: 'TestUser',
      email: `user-${userId}@example.com`,
      password: 'password123',
    });

    await MovieModel.create({
      movieId,
      title: 'Sample Movie',
      description: 'Test description',
      ageRating: 'PG',
      genre: 'Drama',
      releaseDate: new Date(),
      director: 'Director',
      durationTime: '01:30:00',
    });

    await MovieTheaterModel.create({
      theaterId,
      address: '123 Main St',
      postalCode: '75000',
      city: 'Paris',
      phone: '0102030405',
      email: 'theater@example.com',
    });

    await MovieHallModel.create({
      hallId,
      theaterId,
      seatsLayout: [
        [1, 2],
        [3, 4],
      ],
    });

    await ScreeningModel.create({
      screeningId,
      movieId,
      theaterId,
      hallId,
      startTime: new Date(),
      durationTime: '01:30:00',
    });

    await BookingModel.create({
      bookingId,
      userId,
      screeningId,
      seatsNumber: 2,
    });

    return bookingId;
  };

  it('should create a comment if booking exists', async () => {
    const bookingId = await createBooking();
    const comment = await service.createComment({
      bookingId,
      comment: 'Great',
      rating: 5,
    });
    expect(comment).toBeDefined();
    expect(comment.bookingId).toBe(bookingId);
  });

  it('should throw if booking does not exist', async () => {
    await expect(
      service.createComment({
        bookingId: uuidv4(),
        comment: 'Invalid',
        rating: 4,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw if comment already exists', async () => {
    const bookingId = await createBooking();
    await service.createComment({ bookingId, comment: 'First', rating: 4 });
    await expect(
      service.createComment({ bookingId, comment: 'Second', rating: 3 })
    ).rejects.toThrow(ConflictError);
  });

  // Removed: BadRequestError tests for UUID and rating — now handled by express-validator

  describe('getCommentsByMovieId', () => {
    it('should return all comments for a movie', async () => {
      const bookingId = await createBooking();
      const screening = await ScreeningModel.findOne();
      const movieId = screening!.movieId;

      await service.createComment({ bookingId, comment: 'Nice', rating: 4 });

      const comments = await service.getCommentsByMovieId(movieId, 'all');
      expect(comments).toHaveLength(1);
      expect(comments[0].comment).toBe('Nice');
    });

    it('should filter comments by status', async () => {
      const bookingId = await createBooking();
      const screening = await ScreeningModel.findOne();
      const movieId = screening!.movieId;

      const created = await service.createComment({
        bookingId,
        comment: 'To Confirm',
        rating: 4,
      });
      await service.confirmComment(created.id);

      const confirmed = await service.getCommentsByMovieId(
        movieId,
        'confirmed'
      );
      expect(confirmed).toHaveLength(1);
      expect(confirmed[0].status).toBe('confirmed');

      const pending = await service.getCommentsByMovieId(movieId, 'pending');
      expect(pending).toHaveLength(0);
    });

    it('should throw if movie has no screenings', async () => {
      const fakeMovieId = uuidv4();
      await expect(service.getCommentsByMovieId(fakeMovieId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('ObjectId validation', () => {
    it('should throw BadRequestError for invalid comment ID in confirmComment()', async () => {
      await expect(service.confirmComment('not-an-id')).rejects.toThrow(
        BadRequestError
      );
    });

    it('should throw BadRequestError for invalid comment ID in deleteComment()', async () => {
      await expect(service.deleteComment('invalid-id')).rejects.toThrow(
        BadRequestError
      );
    });
  });
});
