// src/__tests__/seatBooking/seatBooking.routes.spec.ts

import express, { Express } from 'express';
import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import seatBookingRouter from '../../routes/seatBooking.routes';
import { SeatBookingModel } from '../../models/seatBooking.model';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

// Mock middlewares
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id', role: 'utilisateur' };
    next();
  },
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    authorize: () => (req: any, res: any, next: any) => next(),
    isNotStaff: () => (req: any, res: any, next: any) => next(),
    isBookingOwnerOrStaff: () => (req: any, res: any, next: any) => next(),
  },
}));

let app: Express;
let sequelize: Sequelize;
let testBookingId: string;
let testScreeningId: string;

beforeAll(async () => {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [
      SeatBookingModel,
      BookingModel,
      UserModel,
      ScreeningModel,
      MovieModel,
      MovieTheaterModel,
      MovieHallModel,
    ],
  });

  await sequelize.sync({ force: true });

  app = express();
  app.use(express.json());
  app.use('/seat-bookings', seatBookingRouter);
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
});

beforeEach(async () => {
  await sequelize.sync({ force: true });

  const user = await UserModel.create({
    id: 'test-user-id',
    name: 'TestUser',
    email: 'test@example.com',
    password: 'password123',
  });

  const movie = await MovieModel.create({
    movieId: uuidv4(),
    title: 'Interstellar', // 🔥 Correct: title (was name)
    description: 'Space journey',
    ageRating: 'PG-13', // 🔥 Correct: ageRating (was age)
    genre: 'Sci-Fi',
    releaseDate: new Date('2014-11-07'), // 🔥 Correct: releaseDate (was date)
    director: 'Christopher Nolan', // 🔥 Add mandatory field
    durationTime: "02:20:23", // 🔥 Add mandatory field
  });

  const theater = await MovieTheaterModel.create({
    theaterId: uuidv4(),
    address: '123 Main Street',
    postalCode: '75000',
    city: 'Paris',
    phone: '0102030405',
    email: 'theater@example.com',
  });

  const hall = await MovieHallModel.create({
    hallId: uuidv4(),
    theaterId: theater.theaterId,
    seatsLayout: [
      [1, 2, 3, '', 4, 5],
      [6, 7, 8, '', 9, 10],
    ],
  });

  const screening = await ScreeningModel.create({
    screeningId: uuidv4(),
    movieId: movie.movieId,
    theaterId: theater.theaterId,
    hallId: hall.hallId,
    startTime: new Date('2025-01-01T18:00:00Z'),
    durationTime: "02:20:20",
  });

  testScreeningId = screening.screeningId;

  const booking = await BookingModel.create({
    bookingId: uuidv4(),
    userId: user.id,
    screeningId: screening.screeningId,
    bookingDate: new Date(),
    seatsNumber: 1,
  });

  testBookingId = booking.bookingId;
});

describe('SeatBooking Routes', () => {
  describe('POST /seat-bookings', () => {
    it('should create a seat booking', async () => {
      const seatBookingData = {
        screeningId: testScreeningId,
        seatId: 'A2',
        bookingId: testBookingId,
      };

      const res = await request(app)
        .post('/seat-bookings')
        .send(seatBookingData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('screeningId', testScreeningId);
      expect(res.body).toHaveProperty('seatId', 'A2');
      expect(res.body).toHaveProperty('bookingId', testBookingId);
    });
  });

  describe('GET /seat-bookings/:screeningId/:seatId', () => {
    it('should retrieve a seat booking by screeningId and seatId', async () => {
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: 'A1',
        bookingId: testBookingId,
      });

      const res = await request(app).get(
        `/seat-bookings/${testScreeningId}/A1`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('seatId', 'A1');
    });

    it('should return 404 if seat booking not found', async () => {
      const res = await request(app).get(
        `/seat-bookings/${testScreeningId}/nonexistent-seat`
      );

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /seat-bookings/booking/:bookingId', () => {
    it('should retrieve seat bookings by bookingId', async () => {
      // 👉 Ajoute ça pour créer un seatBooking lié avant de tester
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: 'B1',
        bookingId: testBookingId,
      });

      const res = await request(app).get(
        `/seat-bookings/booking/${testBookingId}`
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('bookingId', testBookingId);
    });
  });

  describe('GET /seat-bookings/screening/:screeningId', () => {
    it('should retrieve seat bookings by screeningId', async () => {
      // 👉 Ajoute ça pour créer un seatBooking lié avant de tester
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: 'C1',
        bookingId: testBookingId,
      });

      const res = await request(app).get(
        `/seat-bookings/screening/${testScreeningId}`
      );
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('screeningId', testScreeningId);
    });
  });



  describe('DELETE /seat-bookings/:screeningId/:seatId', () => {
    it('should delete a seat booking', async () => {
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: 'A3',
        bookingId: testBookingId,
      });

      const res = await request(app).delete(
        `/seat-bookings/${testScreeningId}/A3`
      );

      expect(res.status).toBe(204);

      const deleted = await SeatBookingModel.findOne({
        where: { screeningId: testScreeningId, seatId: 'A3' },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting a nonexistent seat booking', async () => {
      const res = await request(app).delete(
        `/seat-bookings/${testScreeningId}/nonexistent-seat`
      );

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });
});
