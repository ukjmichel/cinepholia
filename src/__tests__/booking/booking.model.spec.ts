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
      models: [
        UserModel,
        MovieModel,
        MovieTheaterModel,
        MovieHallModel,
        ScreeningModel,
        BookingModel,
      ],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Promise.all([
      BookingModel.destroy({ where: {}, truncate: true, cascade: true }),
      ScreeningModel.destroy({ where: {}, truncate: true, cascade: true }),
      MovieHallModel.destroy({ where: {}, truncate: true, cascade: true }),
      MovieTheaterModel.destroy({ where: {}, truncate: true, cascade: true }),
      MovieModel.destroy({ where: {}, truncate: true, cascade: true }),
      UserModel.destroy({ where: {}, truncate: true, cascade: true }),
    ]);
  });

  async function createFullDependencies() {
    const user = await UserModel.create({
      id: 'user-uuid',
      name: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    });

    const movie = await MovieModel.create({
      movieId: 'movie-uuid',
      title: 'Test Movie',
      description: 'A mind-bending thriller',
      ageRating: 'PG-13',
      genre: 'Sci-Fi',
      releaseDate: new Date('2024-01-01'),
      director: 'Test Director',
      durationTime: '02:00:00',
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
      hallId: 'hall-uuid',
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
      durationTime: '02:00:00',
    });

    return { user, screening };
  }

  it('should create a booking with default status "pending"', async () => {
    const { user, screening } = await createFullDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2, // no more bookingDate
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe('pending');
  });

  it('should update booking status to "used"', async () => {
    const { user, screening } = await createFullDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2, // no more bookingDate
    });

    booking.status = 'used';
    await booking.save();

    const updatedBooking = await BookingModel.findByPk(booking.bookingId);
    expect(updatedBooking?.status).toBe('used');
  });

  it('should update booking status to "canceled"', async () => {
    const { user, screening } = await createFullDependencies();

    const booking = await BookingModel.create({
      userId: user.id,
      screeningId: screening.screeningId,
      seatsNumber: 2, // no more bookingDate
    });

    booking.status = 'canceled';
    await booking.save();

    const updatedBooking = await BookingModel.findByPk(booking.bookingId);
    expect(updatedBooking?.status).toBe('canceled');
  });
});
