// src/__tests__/seatBooking/seatBooking.model.spec.ts
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid'; // ✅ ADD THIS
import { SeatBookingModel } from '../../models/seatBooking.model';
import { BookingModel } from '../../models/booking.model';
import { ScreeningModel } from '../../models/screening.model';
import { UserModel } from '../../models/user.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

describe('SeatBookingModel', () => {
  let sequelize: Sequelize;

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
      SeatBookingModel,
    ]);

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a SeatBooking correctly', async () => {
    const user = await UserModel.create({
      id: uuidv4(), // ✅ real UUID
      name: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    });

    const movie = await MovieModel.create({
      movieId: uuidv4(), // ✅
      name: 'TestMovie',
      description: 'An awesome movie',
      age: 'PG-13',
      genre: 'Action',
      date: new Date(),
    });

    const theater = await MovieTheaterModel.create({
      theaterId: uuidv4(), // ✅
      address: '123 Cinema Street',
      postalCode: '75000',
      city: 'Paris',
      phone: '0102030405',
      email: 'contact@cinema.com',
    });

    const hall = await MovieHallModel.create({
      hallId: uuidv4(), // ✅
      theaterId: theater.theaterId,
      seatsLayout: [
        [1, 1, 1],
        [1, 0, 1],
      ],
    });

    const screening = await ScreeningModel.create({
      screeningId: uuidv4(), // ✅
      movieId: movie.movieId,
      theaterId: theater.theaterId,
      hallId: hall.hallId,
      startTime: new Date(),
      durationTime: new Date(),
    });

    const booking = await BookingModel.create({
      bookingId: uuidv4(), // ✅
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 1,
      status: 'pending',
    });

    const seatBooking = await SeatBookingModel.create({
      screeningId: screening.screeningId,
      seatId: 'A1', // ✅ OK
      bookingId: booking.bookingId,
    });

    expect(seatBooking).toBeDefined();
    expect(seatBooking.screeningId).toBe(screening.screeningId);
    expect(seatBooking.seatId).toBe('A1');
    expect(seatBooking.bookingId).toBe(booking.bookingId);
  });

  it('should associate SeatBooking with Booking and Screening', async () => {
    const seatBooking = await SeatBookingModel.findOne({
      where: { seatId: 'A1' },
      include: [BookingModel, ScreeningModel],
    });

    expect(seatBooking).toBeDefined();
    expect(seatBooking!.booking).toBeDefined();
    expect(seatBooking!.screening).toBeDefined();
  });
});
