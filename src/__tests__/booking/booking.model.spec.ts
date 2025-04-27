import { Sequelize } from 'sequelize-typescript';
import { BookingModel } from '../../models/booking.model';
import { UserModel } from '../../models/user.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

describe('BookingModel', () => {
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
    ]);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a booking with default status "pending"', async () => {
    const user = await UserModel.create({
      id: 'user-uuid',
      name: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    });

    const movie = await MovieModel.create({
      movieId: 'dummy-movie-id',
      name: 'Test Movie',
      description: 'A mind-bending thriller',
      age: 'PG-13',
      genre: 'Sci-Fi',
      date: new Date(),
    });

    const theater = await MovieTheaterModel.create({
      theaterId: 'dummy-theater-id',
      address: '123 Test St',
      postalCode: '12345',
      city: 'Test City',
      phone: '123-456-7890',
      email: 'test@example.com',
    });

    const hall = await MovieHallModel.create({
      hallId: 'dummy-hall-id',
      theaterId: theater.theaterId,
      seatsLayout: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 1, 1],
        [1, 1, 1, 1, 1],
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

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      bookingDate: new Date(),
      seatsNumber: 2,
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe('pending');
  });

  it('should update booking status to "used"', async () => {
    const booking = await BookingModel.findOne();
    expect(booking).toBeDefined();

    booking!.status = 'used';
    await booking!.save();

    const updatedBooking = await BookingModel.findByPk(booking!.bookingId);
    expect(updatedBooking!.status).toBe('used');
  });

  it('should update booking status to "canceled"', async () => {
    const booking = await BookingModel.findOne();
    expect(booking).toBeDefined();

    booking!.status = 'canceled';
    await booking!.save();

    const updatedBooking = await BookingModel.findByPk(booking!.bookingId);
    expect(updatedBooking!.status).toBe('canceled');
  });
});
