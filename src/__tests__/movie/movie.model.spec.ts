import { Sequelize } from 'sequelize-typescript';
import { MovieModel } from '../../models/movie.model';

describe('🧪 MovieModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // In-memory DB for testing
      logging: false,
      models: [MovieModel],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a movie with valid attributes', async () => {
    const movie = await MovieModel.create({
      movieId: 'movie123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      ageRating: 'PG-13',
      genre: 'Sci-Fi',
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      durationTime: '02:28:00', 
      posterUrl: 'https://example.com/poster.jpg',
    });

    expect(movie).toBeDefined();
    expect(movie.movieId).toBe('movie123');
    expect(movie.title).toBe('Inception');
    expect(movie.genre).toBe('Sci-Fi');
    expect(movie.ageRating).toBe('PG-13');
    expect(movie.director).toBe('Christopher Nolan');
    expect(movie.durationTime).toBe('02:28:00'); 
    expect(movie.posterUrl).toBe('https://example.com/poster.jpg');
  });

  it('should fail if title is missing', async () => {
    await expect(
      MovieModel.create({
        movieId: 'movie456',
        description: 'No title provided',
        ageRating: 'PG-13',
        genre: 'Drama',
        releaseDate: new Date(),
        director: 'Unknown',
        durationTime: '02:00:00', 
      } as any)
    ).rejects.toThrow();
  });

  it('should fail if description is missing', async () => {
    await expect(
      MovieModel.create({
        movieId: 'movie789',
        title: 'No Description',
        ageRating: 'PG-13',
        genre: 'Action',
        releaseDate: new Date(),
        director: 'Unknown',
        durationTime: '01:30:00', 
      } as any)
    ).rejects.toThrow();
  });

  it('should enforce unique movieId constraint', async () => {
    await MovieModel.create({
      movieId: 'uniqueId',
      title: 'First Movie',
      description: 'First entry',
      ageRating: 'PG',
      genre: 'Adventure',
      releaseDate: new Date(),
      director: 'First Director',
      durationTime: '01:40:00', 
    });

    await expect(
      MovieModel.create({
        movieId: 'uniqueId', // duplicate ID
        title: 'Second Movie',
        description: 'Second entry',
        ageRating: 'PG-13',
        genre: 'Comedy',
        releaseDate: new Date(),
        director: 'Second Director',
        durationTime: '01:50:00',
      })
    ).rejects.toThrow();
  });

  it('should fail if durationTime has invalid format', async () => {
    await expect(
      MovieModel.create({
        movieId: 'invalidDuration',
        title: 'Bad Duration',
        description: 'Invalid duration format',
        ageRating: 'PG-13',
        genre: 'Thriller',
        releaseDate: new Date(),
        director: 'Bad Director',
        durationTime: '90 minutes', // WRONG format
      })
    ).rejects.toThrow('durationTime must be a valid string in format HH:mm:ss');
  });
});
