// src/__tests__/seatBooking/seatBooking.routes.spec.ts

import express, { Express } from 'express';
import request from 'supertest';
import seatBookingRoutes from '../../routes/seatBooking.routes';
import { SeatBookingModel } from '../../models/seatBooking.model';
import { BookingModel } from '../../models/booking.model';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import {
  setupInMemoryDatabase,
  connectInMemoryMongo,
  disconnectInMemoryMongo,
  seedBookingDependencies,
  resetTables,
} from '../../utils/setupTestDb';

// Mock auth middlewares
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    isNotStaff: () => (_req: any, _res: any, next: any) => next(),
    isBookingOwnerOrStaff: () => (_req: any, _res: any, next: any) => next(),
    authorize: () => (_req: any, _res: any, next: any) => next(),
  },
}));

describe('SeatBooking Routes', () => {
  let app: Express;
  let sequelize: Sequelize;
  let testBookingId: string;
  let testScreeningId: string;
  let testSeatId: string = '1'; // Using '1' as it should exist in the seeded layout

  beforeAll(async () => {
    // Setup in-memory databases
    sequelize = await setupInMemoryDatabase();

    // Add SeatBookingModel if not included in setupInMemoryDatabase
    sequelize.addModels([SeatBookingModel]);
    await sequelize.sync({ force: true });

    await connectInMemoryMongo();

    // Setup Express application
    app = express();
    app.use(express.json());
    app.use('/seat-bookings', seatBookingRoutes);
  });

  beforeEach(async () => {
    // Reset database state and seed test data
    await resetTables();
    await SeatBookingModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });

    // Create test data using the seed utility
    const { user, screening } = await seedBookingDependencies();
    testScreeningId = screening.screeningId;

    // Create a booking
    const booking = await BookingModel.create({
      bookingId: uuidv4(),
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 1,
      status: 'pending',
    });
    testBookingId = booking.bookingId;
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
    await sequelize.close();
  });

  describe('POST /', () => {
    it('should create a new seat booking', async () => {
      const seatBookingData = {
        screeningId: testScreeningId,
        seatId: testSeatId,
        bookingId: testBookingId,
      };

      const res = await request(app)
        .post('/seat-bookings')
        .send(seatBookingData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('screeningId', testScreeningId);
      expect(res.body).toHaveProperty('seatId', testSeatId);
      expect(res.body).toHaveProperty('bookingId', testBookingId);

      // Verify the seat booking was actually created in the database
      const seatBooking = await SeatBookingModel.findOne({
        where: { screeningId: testScreeningId, seatId: testSeatId },
      });
      expect(seatBooking).not.toBeNull();
    });

    it('should return 500 if trying to book an already booked seat', async () => {
      // First create a seat booking
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: testSeatId,
        bookingId: testBookingId,
      });

      // Try to book the same seat again
      const seatBookingData = {
        screeningId: testScreeningId,
        seatId: testSeatId,
        bookingId: testBookingId,
      };

      const res = await request(app)
        .post('/seat-bookings')
        .send(seatBookingData);

      expect(res.status).toBe(500); // This would ideally be a 409 Conflict, but your controller returns 500
    });
  });

  describe('GET /booking/:bookingId', () => {
    it('should retrieve seat bookings for a booking', async () => {
      // Create multiple seat bookings for the same booking
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: '1',
        bookingId: testBookingId,
      });

      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: '2',
        bookingId: testBookingId,
      });

      const res = await request(app).get(
        `/seat-bookings/booking/${testBookingId}`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('bookingId', testBookingId);
    });

    it('should return empty array when no bookings exist', async () => {
      const nonExistentBookingId = uuidv4();
      const res = await request(app).get(
        `/seat-bookings/booking/${nonExistentBookingId}`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /screening/:screeningId', () => {
    it('should retrieve seat bookings for a screening', async () => {
      // Create seat bookings for the screening using the existing booking
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: '1',
        bookingId: testBookingId,
      });

      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: '2',
        bookingId: testBookingId, // Using the same booking ID is fine
      });

      const res = await request(app).get(
        `/seat-bookings/screening/${testScreeningId}`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('screeningId', testScreeningId);
    });
  });

  describe('GET /:screeningId/:seatId', () => {
    it('should retrieve a specific seat booking', async () => {
      // Create a seat booking
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: testSeatId,
        bookingId: testBookingId,
      });

      const res = await request(app).get(
        `/seat-bookings/${testScreeningId}/${testSeatId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('screeningId', testScreeningId);
      expect(res.body).toHaveProperty('seatId', testSeatId);
      expect(res.body).toHaveProperty('bookingId', testBookingId);
    });

    it('should return 404 when seat booking does not exist', async () => {
      const nonExistentSeatId = 'Z99';
      const res = await request(app).get(
        `/seat-bookings/${testScreeningId}/${nonExistentSeatId}`
      );

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:screeningId/:seatId', () => {
    it('should delete a seat booking', async () => {
      // Create a seat booking
      await SeatBookingModel.create({
        screeningId: testScreeningId,
        seatId: testSeatId,
        bookingId: testBookingId,
      });

      const res = await request(app).delete(
        `/seat-bookings/${testScreeningId}/${testSeatId}`
      );

      expect(res.status).toBe(204);

      // Verify the seat booking was actually deleted
      const seatBooking = await SeatBookingModel.findOne({
        where: { screeningId: testScreeningId, seatId: testSeatId },
      });
      expect(seatBooking).toBeNull();
    });

    it('should return 404 when seat booking to delete does not exist', async () => {
      const nonExistentSeatId = 'Z99';
      const res = await request(app).delete(
        `/seat-bookings/${testScreeningId}/${nonExistentSeatId}`
      );

      expect(res.status).toBe(404);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid data when creating seat booking', async () => {
      const invalidData = {
        // Missing required fields
        screeningId: testScreeningId,
        // No seatId
        bookingId: testBookingId,
      };

      const res = await request(app).post('/seat-bookings').send(invalidData);

      // Expect an error (exact status depends on your implementation)
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle malformed IDs when retrieving seat bookings', async () => {
      const malformedId = 'not-a-valid-uuid';
      const res = await request(app).get(
        `/seat-bookings/booking/${malformedId}`
      );

      // Check that the API handles this gracefully
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
