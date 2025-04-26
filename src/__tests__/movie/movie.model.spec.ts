import { Sequelize } from 'sequelize-typescript';
import { MovieModel } from '../../models/movie.model';

describe('MovieModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
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
      name: 'Inception',
      description: 'A mind-bending thriller',
      age: 'PG-13',
      genre: 'Sci-Fi',
      date: new Date('2010-07-16'),
    });

    expect(movie).toBeDefined();
    expect(movie.movieId).toBe('movie123');
    expect(movie.name).toBe('Inception');
    expect(movie.genre).toBe('Sci-Fi');
    expect(movie.age).toBe('PG-13');
  });

  it('should fail if name is missing', async () => {
    await expect(
      MovieModel.create({
        movieId: 'movie456',
        description: 'No name provided',
        age: 'PG-13',
        genre: 'Drama',
        date: new Date(),
      } as any) // 👈 explicitly cast as 'any' to allow partial object
    ).rejects.toThrow();
  });

  it('should fail if description is missing', async () => {
    await expect(
      MovieModel.create({
        movieId: 'movie789',
        name: 'No Description',
        age: 'PG-13',
        genre: 'Action',
        date: new Date(),
      } as any)
    ).rejects.toThrow();
  });

  it('should enforce unique movieId constraint', async () => {
    await MovieModel.create({
      movieId: 'uniqueId',
      name: 'First Movie',
      description: 'First entry',
      age: 'PG',
      genre: 'Adventure',
      date: new Date(),
    });

    await expect(
      MovieModel.create({
        movieId: 'uniqueId', // duplicate ID
        name: 'Second Movie',
        description: 'Second entry',
        age: 'PG-13',
        genre: 'Comedy',
        date: new Date(),
      })
    ).rejects.toThrow();
  });
});
