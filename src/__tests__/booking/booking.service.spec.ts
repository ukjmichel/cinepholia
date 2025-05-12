import { Sequelize } from 'sequelize-typescript';
import { BookingService } from '../../services/booking.service';
import { BookingModel } from '../../models/booking.model';
import {
  setupInMemoryDatabase,
  resetTables,
  seedBookingDependencies,
} from '../../utils/setupTestDb';

describe('BookingService', () => {
  let sequelize: Sequelize;
  let bookingService: BookingService;

  beforeAll(async () => {
    sequelize = await setupInMemoryDatabase();
    bookingService = new BookingService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await resetTables();
  });

  it('should create a booking', async () => {
    const { user, screening } = await seedBookingDependencies();

    const booking = await bookingService.createBooking({
      bookingId: 'booking123',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
      status: 'pending',
    });

    expect(booking).toBeDefined();
    expect(booking.bookingId).toBe('booking123');
    expect(booking.userId).toBe(user.id);
  });

  it('should get a booking by ID', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.create({
      bookingId: 'booking456',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
      status: 'pending',
    });

    const foundBooking = await bookingService.getBookingById('booking456');

    expect(foundBooking).toBeDefined();
    expect(foundBooking?.bookingId).toBe('booking456');
  });

  it('should return null if booking not found by ID', async () => {
    const booking = await bookingService.getBookingById('nonexistent-id');
    expect(booking).toBeNull();
  });

  it('should get all bookings', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.bulkCreate([
      {
        bookingId: 'booking1',
        userId: user.id,
        screeningId: screening.screeningId,
        seatsNumber: 2,
        status: 'pending',
      },
      {
        bookingId: 'booking2',
        userId: user.id,
        screeningId: screening.screeningId,
        seatsNumber: 1,
        status: 'pending',
      },
    ]);

    const bookings = await bookingService.getAllBookings();
    expect(bookings.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a booking', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.create({
      bookingId: 'bookingToUpdate',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2,
      status: 'pending',
    });

    const updated = await bookingService.updateBooking('bookingToUpdate', {
      status: 'used',
    });

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('used');
  });

  it('should return null when updating non-existing booking', async () => {
    const updated = await bookingService.updateBooking('nonexistent', {
      status: 'used',
    });
    expect(updated).toBeNull();
  });

  it('should update booking to "used"', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.create({
      bookingId: 'bookingToUse',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 1,
      status: 'pending',
    });

    const updated = await bookingService.markBookingAsUsed('bookingToUse');

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('used');
  });

  it('should return null when marking non-existing booking as used', async () => {
    const updated = await bookingService.markBookingAsUsed('nonexistent');
    expect(updated).toBeNull();
  });

  it('should update booking to "canceled"', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.create({
      bookingId: 'bookingToCancel',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 1,
      status: 'pending',
    });

    const updated = await bookingService.cancelBooking('bookingToCancel');

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('canceled');
  });

  it('should return null when canceling non-existing booking', async () => {
    const updated = await bookingService.cancelBooking('nonexistent');
    expect(updated).toBeNull();
  });

  it('should delete a booking', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.create({
      bookingId: 'bookingToDelete',
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 3,
      status: 'pending',
    });

    const deleted = await bookingService.deleteBooking('bookingToDelete');
    expect(deleted).toBe(true);
  });

  it('should return false when deleting a non-existing booking', async () => {
    const deleted = await bookingService.deleteBooking('nonexistent-id');
    expect(deleted).toBe(false);
  });

  it('should get all bookings for a user', async () => {
    const { user, screening } = await seedBookingDependencies();

    await BookingModel.bulkCreate([
      {
        bookingId: 'user-booking1',
        userId: user.id,
        screeningId: screening.screeningId,
        seatsNumber: 2,
        status: 'pending',
      },
      {
        bookingId: 'user-booking2',
        userId: user.id,
        screeningId: screening.screeningId,
        seatsNumber: 1,
        status: 'pending',
      },
    ]);

    const bookings = await bookingService.getBookingsByUserId(user.id);

    expect(bookings.length).toBe(2);
  });
});
