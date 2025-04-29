import { Sequelize } from 'sequelize-typescript';
import { BookingService } from '../../services/booking.service';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

describe('BookingService', () => {
  let sequelize: Sequelize;
  let bookingService: BookingService;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    sequelize.addModels([
      UserModel,
      MovieModel,
      MovieTheaterModel,
      MovieHallModel,
      ScreeningModel,
      BookingModel,
    ]);
    await sequelize.sync({ force: true });

    bookingService = new BookingService();
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    await BookingModel.destroy({ where: {}, truncate: true, cascade: true });
    await ScreeningModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
    await MovieTheaterModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
    await UserModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  async function setupDependencies() {
    const user = await UserModel.create({
      id: 'user-uuid',
      name: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    });

    const movie = await MovieModel.create({
      movieId: 'movie-uuid',
      title: 'Test Movie', // 🛠️ corrected here: title instead of name
      description: 'A mind-bending thriller',
      ageRating: 'PG-13', // 🛠️ corrected: age -> ageRating
      genre: 'Sci-Fi',
      releaseDate: new Date(), // 🛠️ corrected: date -> releaseDate
      director: 'Christopher Nolan', // 🛠️ added required field: director
      durationMinutes: 120, // 🛠️ added required field: durationMinutes
    });

    const theater = await MovieTheaterModel.create({
      theaterId: 'theater-uuid',
      address: '123 Test St',
      postalCode: '12345',
      city: 'Test City',
      phone: '123-456-7890',
      email: 'test@example.com',
    });

    const hall = await MovieHallModel.create({
      theaterId: theater.theaterId,
      hallId: 'hall-uuid',
      seatsLayout: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
    });

    const screening = await ScreeningModel.create({
      screeningId: 'screening-uuid',
      movieId: movie.movieId,
      theaterId: theater.theaterId,
      hallId: hall.hallId,
      startTime: new Date(),
      durationTime: new Date(),
    });

    return { user, screening };
  }

  it('should create a booking', async () => {
    const { user, screening } = await setupDependencies();

    const booking = await bookingService.createBooking({
      bookingId: 'booking123',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 2,
      status: 'pending',
    });

    expect(booking).toBeDefined();
    expect(booking.bookingId).toBe('booking123');
    expect(booking.userId).toBe(user.id);
  });

  it('should get a booking by ID', async () => {
    const { user, screening } = await setupDependencies();

    await BookingModel.create({
      bookingId: 'booking456',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
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
    const { user, screening } = await setupDependencies();

    await BookingModel.bulkCreate([
      {
        bookingId: 'booking1',
        userId: user.id,
        screeningId: screening.screeningId,
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'pending',
      },
      {
        bookingId: 'booking2',
        userId: user.id,
        screeningId: screening.screeningId,
        bookingDate: new Date(),
        seatsNumber: 1,
        status: 'pending',
      },
    ]);

    const bookings = await bookingService.getAllBookings();

    expect(bookings.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a booking', async () => {
    const { user, screening } = await setupDependencies();

    await BookingModel.create({
      bookingId: 'bookingToUpdate',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
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
    const { user, screening } = await setupDependencies();

    await BookingModel.create({
      bookingId: 'bookingToUse',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 1,
      status: 'pending',
    });

    const updatedBooking = await bookingService.markBookingAsUsed(
      'bookingToUse'
    );

    expect(updatedBooking).toBeDefined();
    expect(updatedBooking?.status).toBe('used');
  });

  it('should return null when marking non-existing booking as used', async () => {
    const updatedBooking = await bookingService.markBookingAsUsed(
      'nonexistent'
    );
    expect(updatedBooking).toBeNull();
  });

  it('should update booking to "canceled"', async () => {
    const { user, screening } = await setupDependencies();

    await BookingModel.create({
      bookingId: 'bookingToCancel',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 1,
      status: 'pending',
    });

    const updatedBooking = await bookingService.cancelBooking(
      'bookingToCancel'
    );

    expect(updatedBooking).toBeDefined();
    expect(updatedBooking?.status).toBe('canceled');
  });

  it('should return null when canceling non-existing booking', async () => {
    const updatedBooking = await bookingService.cancelBooking('nonexistent');
    expect(updatedBooking).toBeNull();
  });

  it('should delete a booking', async () => {
    const { user, screening } = await setupDependencies();

    await BookingModel.create({
      bookingId: 'bookingToDelete',
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
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
    const { user, screening } = await setupDependencies();

    await BookingModel.bulkCreate([
      {
        bookingId: 'user-booking1',
        userId: user.id,
        screeningId: screening.screeningId,
        bookingDate: new Date(),
        seatsNumber: 2,
        status: 'pending',
      },
      {
        bookingId: 'user-booking2',
        userId: user.id,
        screeningId: screening.screeningId,
        bookingDate: new Date(),
        seatsNumber: 1,
        status: 'pending',
      },
    ]);

    const bookings = await bookingService.getBookingsByUserId(user.id);

    expect(bookings.length).toBe(2);
  });
});
