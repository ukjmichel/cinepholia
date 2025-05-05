import { Sequelize } from 'sequelize-typescript';
import { MovieModel } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';

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
      title: 'Inception',
      description: 'A mind-bending thriller',
      ageRating: 'PG-13',
      genre: 'Sci-Fi',
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      durationTime: '02:28:00', // updated
    };

    const movie = await movieService.createMovie(movieData);

    expect(movie).toBeDefined();
    expect(movie.movieId).toBe('movie123');
    expect(movie.title).toBe('Inception');
    expect(movie.director).toBe('Christopher Nolan');
  });

  it('should get a movie by ID', async () => {
    await MovieModel.create({
      movieId: 'movie456',
      title: 'Interstellar',
      description: 'A journey through space and time',
      ageRating: 'PG-13',
      genre: 'Sci-Fi',
      releaseDate: new Date('2014-11-07'),
      director: 'Christopher Nolan',
      durationTime: '02:49:00', // updated
    });

    const foundMovie = await movieService.getMovieById('movie456');

    expect(foundMovie).toBeDefined();
    expect(foundMovie?.title).toBe('Interstellar');
  });

  it('should throw NotFoundError if movie not found by ID', async () => {
    await expect(movieService.getMovieById('nonexistent-id')).rejects.toThrow(
      NotFoundError
    );
  });

  it('should get all movies', async () => {
    await MovieModel.bulkCreate([
      {
        movieId: 'movie1',
        title: 'Movie One',
        description: 'First description',
        ageRating: 'PG',
        genre: 'Drama',
        releaseDate: new Date(),
        director: 'Director One',
        durationTime: '02:00:00', // updated
      },
      {
        movieId: 'movie2',
        title: 'Movie Two',
        description: 'Second description',
        ageRating: 'R',
        genre: 'Horror',
        releaseDate: new Date(),
        director: 'Director Two',
        durationTime: '01:40:00', // updated
      },
    ]);

    const movies = await movieService.getAllMovies();
    expect(movies.length).toBe(2);
  });

  it('should update a movie', async () => {
    await MovieModel.create({
      movieId: 'movieToUpdate',
      title: 'Old Title',
      description: 'Old description',
      ageRating: 'PG',
      genre: 'Adventure',
      releaseDate: new Date(),
      director: 'Old Director',
      durationTime: '01:30:00', // updated
    });

    const updatedMovie = await movieService.updateMovie('movieToUpdate', {
      title: 'New Title',
      description: 'Updated description',
    });

    expect(updatedMovie).toBeDefined();
    expect(updatedMovie?.title).toBe('New Title');
    expect(updatedMovie?.description).toBe('Updated description');
  });

  it('should throw NotFoundError when updating a non-existing movie', async () => {
    await expect(
      movieService.updateMovie('nonexistent-id', {
        title: 'Updated Title',
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should delete a movie', async () => {
    await MovieModel.create({
      movieId: 'movieToDelete',
      title: 'Delete Me',
      description: 'This will be deleted',
      ageRating: 'PG',
      genre: 'Drama',
      releaseDate: new Date(),
      director: 'Director Delete',
      durationTime: '01:35:00', // updated
    });

    await expect(
      movieService.deleteMovie('movieToDelete')
    ).resolves.toBeUndefined();
  });

  it('should throw NotFoundError when deleting a non-existing movie', async () => {
    await expect(movieService.deleteMovie('nonexistent-id')).rejects.toThrow(
      NotFoundError
    );
  });

  it('should search movies by title, genre, and director', async () => {
    await MovieModel.bulkCreate([
      {
        movieId: 'movie1',
        title: 'The Great Adventure',
        description: 'Epic story',
        ageRating: 'PG',
        genre: 'Adventure',
        releaseDate: new Date('2020-01-01'),
        director: 'John Doe',
        durationTime: '02:00:00', // updated
      },
      {
        movieId: 'movie2',
        title: 'Space Journey',
        description: 'Into the stars',
        ageRating: 'PG-13',
        genre: 'Sci-Fi',
        releaseDate: new Date('2021-01-01'),
        director: 'Jane Smith',
        durationTime: '02:10:00', // updated
      },
      {
        movieId: 'movie3',
        title: 'Romantic Escape',
        description: 'Love story',
        ageRating: 'R',
        genre: 'Romance',
        releaseDate: new Date('2022-01-01'),
        director: 'John Doe',
        durationTime: '01:50:00', // updated
      },
    ]);

    const searchByTitle = await movieService.searchMovies({ title: 'Space' });
    expect(searchByTitle.length).toBe(1);
    expect(searchByTitle[0].title).toBe('Space Journey');

    const searchByGenre = await movieService.searchMovies({
      genre: 'Adventure',
    });
    expect(searchByGenre.length).toBe(1);
    expect(searchByGenre[0].genre).toBe('Adventure');

    const searchByDirector = await movieService.searchMovies({
      director: 'John Doe',
    });
    expect(searchByDirector.length).toBe(2);

    const noResult = await movieService.searchMovies({
      title: 'Nonexistent Movie',
    });
    expect(noResult.length).toBe(0);
  });
});
