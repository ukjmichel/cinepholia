import { Sequelize } from 'sequelize-typescript';
import { SeatBookingModel } from '../../models/seatBooking.model';
import { ScreeningModel } from '../../models/screening.model';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';
import { SeatBookingService } from '../../services/seatBooking.service';
import { v4 as uuidv4 } from 'uuid';

describe('SeatBookingService', () => {
  let sequelize: Sequelize;
  let seatBookingService: SeatBookingService;

  // Common IDs for setup
  let screeningId: string;
  let bookingId: string;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [
        SeatBookingModel,
        BookingModel,
        ScreeningModel,
        UserModel,
        MovieModel,
        MovieTheaterModel,
        MovieHallModel,
      ],
    });
    await sequelize.sync({ force: true });

    seatBookingService = new SeatBookingService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const user = await UserModel.create({
      id: uuidv4(),
      name: 'TestUser',
      email: 'test@example.com',
      password: 'securepassword',
    });

    const movie = await MovieModel.create({
      movieId: uuidv4(),
      name: 'Interstellar',
      description: 'Space journey',
      age: '10+',
      genre: 'Sci-Fi',
      date: new Date(),
    });

    const theater = await MovieTheaterModel.create({
      theaterId: uuidv4(),
      address: '100 Space Road',
      postalCode: '12345',
      city: 'Galaxy City',
      phone: '0123456789',
      email: 'galaxy@example.com',
    });

    const hall = await MovieHallModel.create({
      hallId: uuidv4(),
      theaterId: theater.theaterId,
      seatsLayout: [[1, 2, '', 3]],
    });

    const screening = await ScreeningModel.create({
      screeningId: uuidv4(),
      movieId: movie.movieId,
      theaterId: theater.theaterId,
      hallId: hall.hallId,
      startTime: new Date(),
      durationTime: new Date('1970-01-01T02:00:00Z'),
    });

    screeningId = screening.screeningId;

    const booking = await BookingModel.create({
      bookingId: uuidv4(),
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 1,
    });

    bookingId = booking.bookingId;
  });

  it('should create a seat booking', async () => {
    const seatBooking = await seatBookingService.createSeatBooking({
      screeningId,
      seatId: 'A1',
      bookingId,
    });

    expect(seatBooking).toBeDefined();
    expect(seatBooking.screeningId).toBe(screeningId);
    expect(seatBooking.seatId).toBe('A1');
    expect(seatBooking.bookingId).toBe(bookingId);
  });

  it('should get a seat booking by screeningId and seatId', async () => {
    await seatBookingService.createSeatBooking({
      screeningId,
      seatId: 'A2',
      bookingId,
    });

    const found = await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
      screeningId,
      'A2'
    );

    expect(found).toBeDefined();
    expect(found?.seatId).toBe('A2');
  });

  it('should return null if seat booking not found', async () => {
    const found = await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
      screeningId,
      'Z99'
    );

    expect(found).toBeNull();
  });

  it('should get all seat bookings by bookingId', async () => {
    await seatBookingService.createSeatBooking({
      screeningId,
      seatId: 'B1',
      bookingId,
    });

    const bookings = await seatBookingService.getSeatBookingsByBookingId(
      bookingId
    );

    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].bookingId).toBe(bookingId);
  });

  it('should get all seat bookings by screeningId', async () => {
    await seatBookingService.createSeatBooking({
      screeningId,
      seatId: 'C1',
      bookingId,
    });

    const bookings = await seatBookingService.getSeatBookingsByScreeningId(
      screeningId
    );

    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].screeningId).toBe(screeningId);
  });

  it('should delete a seat booking', async () => {
    await seatBookingService.createSeatBooking({
      screeningId,
      seatId: 'D1',
      bookingId,
    });

    const deleted = await seatBookingService.deleteSeatBooking(
      screeningId,
      'D1'
    );

    expect(deleted).toBe(true);

    const findAgain =
      await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
        screeningId,
        'D1'
      );

    expect(findAgain).toBeNull();
  });

  it('should return false when deleting non-existing seat booking', async () => {
    const deleted = await seatBookingService.deleteSeatBooking(
      screeningId,
      'Z99'
    );

    expect(deleted).toBe(false);
  });
});
