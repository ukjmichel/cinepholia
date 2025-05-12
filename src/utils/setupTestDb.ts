import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { BookingModel } from '../models/booking.model';
import { UserModel } from '../models/user.model';
import { MovieModel } from '../models/movie.model';
import { MovieTheaterModel } from '../models/movietheater.model';
import { MovieHallModel } from '../models/movieHall.model';
import { ScreeningModel } from '../models/screening.model';
import { SeatBookingModel } from '../models/seatBooking.model';

let mongoServer: MongoMemoryServer;

/**
 * Initializes an in-memory SQLite Sequelize instance with all required models.
 */
export async function setupInMemoryDatabase(): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [
      UserModel,
      MovieModel,
      MovieTheaterModel,
      MovieHallModel,
      ScreeningModel,
      BookingModel,
      SeatBookingModel,
    ],
  });

  await sequelize.sync({ force: true });
  return sequelize;
}

/**
 * Initializes in-memory MongoDB connection using mongodb-memory-server.
 */
export async function connectInMemoryMongo(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

/**
 * Closes the in-memory MongoDB connection and stops the server.
 */
export async function disconnectInMemoryMongo(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}

/**
 * Seeds the database with movie, theater, hall, and screening entities.
 */
export async function seedBaseScreeningDependencies(): Promise<{
  movieId: string;
  theaterId: string;
  hallId: string;
  screening: ScreeningModel;
}> {
  const movieId = uuidv4();
  const theaterId = uuidv4();
  const hallId = uuidv4();
  const screeningId = uuidv4();

  await MovieModel.create({
    movieId,
    title: 'Inception',
    description: 'A mind-bending thriller',
    ageRating: 'PG-13',
    genre: 'Sci-Fi',
    releaseDate: new Date('2010-07-16'),
    director: 'Christopher Nolan',
    durationTime: '02:00:00',
  });

  await MovieTheaterModel.create({
    theaterId,
    address: '123 Main Street',
    postalCode: '75000',
    city: 'Paris',
    phone: '0102030405',
    email: 'theater@example.com',
  });

  await MovieHallModel.create({
    hallId,
    theaterId,
    seatsLayout: [
      [1, 2, 3, '', 4, 5],
      [6, 7, 8, '', 9, 10],
    ],
  });

  const screening = await ScreeningModel.create({
    screeningId,
    movieId,
    theaterId,
    hallId,
    startTime: new Date('2025-01-01T18:00:00Z'),
    durationTime: '02:30:00',
  });

  return { movieId, theaterId, hallId, screening };
}

export async function seedScreeningDependencies() {
  const { movieId, theaterId, hallId, screening } =
    await seedBaseScreeningDependencies();
  return { movieId, theaterId, hallId, screeningId: screening.screeningId };
}

export async function seedBookingDependencies() {
  const user = await UserModel.create({
    id: 'user-uuid',
    name: 'TestUser',
    email: 'test@example.com',
    password: 'password123',
  });

  const { screening } = await seedBaseScreeningDependencies();

  return { user, screening };
}

/**
 * Utility to clean all tables before each test.
 */
export async function resetTables() {
  await BookingModel.destroy({ where: {}, truncate: true, cascade: true });
  await ScreeningModel.destroy({ where: {}, truncate: true, cascade: true });
  await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
  await MovieTheaterModel.destroy({ where: {}, truncate: true, cascade: true });
  await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
  await UserModel.destroy({ where: {}, truncate: true, cascade: true });
  await SeatBookingModel.destroy({ where: {}, truncate: true, cascade: true });
}
