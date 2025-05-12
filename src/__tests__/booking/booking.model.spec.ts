import { Sequelize } from 'sequelize-typescript';
import {
  setupInMemoryDatabase,
  seedBookingDependencies,
  resetTables,
} from '../../utils/setupTestDb';
import { BookingModel } from '../../models/booking.model';

describe('BookingModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = await setupInMemoryDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await resetTables();
  });

  it('should create a booking with default status "pending"', async () => {
    const { user, screening } = await seedBookingDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe('pending');
  });

  it('should update booking status to "used"', async () => {
    const { user, screening } = await seedBookingDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
    });

    booking.status = 'used';
    await booking.save();

    const updatedBooking = await BookingModel.findByPk(booking.bookingId);
    expect(updatedBooking?.status).toBe('used');
  });

  it('should update booking status to "canceled"', async () => {
    const { user, screening } = await seedBookingDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
    });

    booking.status = 'canceled';
    await booking.save();

    const updatedBooking = await BookingModel.findByPk(booking.bookingId);
    expect(updatedBooking?.status).toBe('canceled');
  });
});
