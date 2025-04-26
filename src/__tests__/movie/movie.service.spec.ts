import { Sequelize } from 'sequelize-typescript';
import { MovieModel } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';

describe('MovieService', () => {
  let sequelize: Sequelize;
  let movieService: MovieService;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [MovieModel],
    });

    await sequelize.sync({ force: true });

    movieService = new MovieService();
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    await MovieModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a movie', async () => {
    const movieData = {
      movieId: 'movie123',
      name: 'Inception',
      description: 'A mind-bending thriller',
      age: 'PG-13',
      genre: 'Sci-Fi',
      date: new Date('2010-07-16'),
    };

    const movie = await movieService.createMovie(movieData);

    expect(movie).toBeDefined();
    expect(movie.movieId).toBe('movie123');
    expect(movie.name).toBe('Inception');
  });

  it('should get a movie by ID', async () => {
    const movie = await MovieModel.create({
      movieId: 'movie456',
      name: 'Interstellar',
      description: 'A journey through space and time',
      age: 'PG-13',
      genre: 'Sci-Fi',
      date: new Date('2014-11-07'),
    });

    const foundMovie = await movieService.getMovieById('movie456');

    expect(foundMovie).toBeDefined();
    expect(foundMovie?.name).toBe('Interstellar');
  });

  it('should return null if movie not found by ID', async () => {
    const movie = await movieService.getMovieById('nonexistent-id');
    expect(movie).toBeNull();
  });

  it('should get all movies', async () => {
    await MovieModel.bulkCreate([
      {
        movieId: 'movie1',
        name: 'Movie One',
        description: 'Description One',
        age: 'PG',
        genre: 'Drama',
        date: new Date(),
      },
      {
        movieId: 'movie2',
        name: 'Movie Two',
        description: 'Description Two',
        age: 'R',
        genre: 'Horror',
        date: new Date(),
      },
    ]);

    const movies = await movieService.getAllMovies();
    expect(movies.length).toBe(2);
  });

  it('should update a movie', async () => {
    const movie = await MovieModel.create({
      movieId: 'movieToUpdate',
      name: 'Old Name',
      description: 'Old Description',
      age: 'PG',
      genre: 'Drama',
      date: new Date(),
    });

    const updatedMovie = await movieService.updateMovie('movieToUpdate', {
      name: 'New Name',
      description: 'Updated Description',
    });

    expect(updatedMovie).toBeDefined();
    expect(updatedMovie?.name).toBe('New Name');
    expect(updatedMovie?.description).toBe('Updated Description');
  });

  it('should return null when updating a non-existing movie', async () => {
    const updatedMovie = await movieService.updateMovie('nonexistent-id', {
      name: 'Updated Name',
    });
    expect(updatedMovie).toBeNull();
  });

  it('should delete a movie', async () => {
    await MovieModel.create({
      movieId: 'movieToDelete',
      name: 'Delete Me',
      description: 'To be deleted',
      age: 'PG',
      genre: 'Drama',
      date: new Date(),
    });

    const deleted = await movieService.deleteMovie('movieToDelete');

    expect(deleted).toBe(true);
  });

  it('should return false when deleting a non-existing movie', async () => {
    const deleted = await movieService.deleteMovie('nonexistent-id');
    expect(deleted).toBe(false);
  });
});
