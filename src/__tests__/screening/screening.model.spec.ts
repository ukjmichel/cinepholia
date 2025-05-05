import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ScreeningModel } from '../../models/screening.model';
import { MovieModel } from '../../models/movie.model';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { MovieHallModel } from '../../models/movieHall.model';

describe('ScreeningModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [ScreeningModel, MovieModel, MovieTheaterModel, MovieHallModel],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await ScreeningModel.destroy({ where: {} });
    await MovieModel.destroy({ where: {} });
    await MovieTheaterModel.destroy({ where: {} });
    await MovieHallModel.destroy({ where: {} });
  });

  it('should create a screening with valid attributes', async () => {
    // 1. Create a Movie
    await MovieModel.create({
      movieId: 'movie123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      ageRating: '13+',
      genre: 'Sci-Fi',
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      durationTime: "02:30:00",
    });

    // 2. Create a MovieTheater
    await MovieTheaterModel.create({
      theaterId: 'theater123',
      address: '123 Main Street',
      postalCode: '75000',
      city: 'Paris',
      phone: '0102030405',
      email: 'theater@example.com',
    });

    // 3. Create a MovieHall
    await MovieHallModel.create({
      hallId: 'hall123',
      theaterId: 'theater123',
      seatsLayout: [
        [1, 2, 3, '', 4, 5],
        [6, 7, 8, '', 9, 10],
      ],
    });

    // 4. Now create a Screening
    const screeningData = {
      screeningId: uuidv4(),
      movieId: 'movie123',
      theaterId: 'theater123',
      hallId: 'hall123',
      startTime: new Date('2025-01-01T18:00:00Z'),
      durationTime: '02:30:00', // <-- send a string, not a Date ✅
    };

    const screening = await ScreeningModel.create(screeningData);

    expect(screening).toBeDefined();
    expect(screening.movieId).toBe('movie123');
    expect(screening.theaterId).toBe('theater123');
    expect(screening.hallId).toBe('hall123');

    // Check that the duration string is exactly correct
    expect(screening.durationTime).toBe('02:30:00'); // ✅
  });
});
