// src/__tests__/seatBooking/seatBooking.model.spec.ts
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import { SeatBookingModel } from '../../models/seatBooking.model';
import { BookingModel } from '../../models/booking.model';
import { ScreeningModel } from '../../models/screening.model';
import {
  setupInMemoryDatabase,
  connectInMemoryMongo,
  disconnectInMemoryMongo,
  seedBookingDependencies,
  resetTables,
} from '../../utils/setupTestDb';

let sequelize: Sequelize;

beforeAll(async () => {
  // Setup in-memory SQLite
  sequelize = await setupInMemoryDatabase();

  // Add SeatBookingModel if it's not included in setupInMemoryDatabase
  sequelize.addModels([SeatBookingModel]);
  await sequelize.sync({ force: true });

  // Setup in-memory MongoDB
  await connectInMemoryMongo();
});

afterAll(async () => {
  await disconnectInMemoryMongo();
  await sequelize.close();
});

beforeEach(async () => {
  await resetTables();
});

describe('SeatBookingModel', () => {
  it('should create a SeatBooking correctly', async () => {
    // Use the provided utility to seed dependencies
    const { user, screening } = await seedBookingDependencies();

    const booking = await BookingModel.create({
      bookingId: uuidv4(),
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 1,
      status: 'pending',
    });

    const seatBooking = await SeatBookingModel.create({
      screeningId: screening.screeningId,
      seatId: 'A1',
      bookingId: booking.bookingId,
    });

    expect(seatBooking).toBeDefined();
    expect(seatBooking.screeningId).toBe(screening.screeningId);
    expect(seatBooking.seatId).toBe('A1');
    expect(seatBooking.bookingId).toBe(booking.bookingId);
  });

  it('should associate SeatBooking with Booking and Screening', async () => {
    // Use the provided utility to seed dependencies
    const { user, screening } = await seedBookingDependencies();

    const booking = await BookingModel.create({
      bookingId: uuidv4(),
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 1,
      status: 'pending',
    });

    await SeatBookingModel.create({
      screeningId: screening.screeningId,
      seatId: 'A1',
      bookingId: booking.bookingId,
    });

    const seatBooking = await SeatBookingModel.findOne({
      where: { seatId: 'A1' },
      include: [BookingModel, ScreeningModel],
    });

    expect(seatBooking).toBeDefined();
    expect(seatBooking!.booking).toBeDefined();
    expect(seatBooking!.screening).toBeDefined();
    expect(seatBooking!.booking.bookingId).toBe(booking.bookingId);
    expect(seatBooking!.screening.screeningId).toBe(screening.screeningId);
  });
});
