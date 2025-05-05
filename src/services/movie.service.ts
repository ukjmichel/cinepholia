import { Op } from 'sequelize';
import { MovieModel, MovieAttributes } from '../models/movie.model';
import { NotFoundError } from '../errors/NotFoundError';
import { ConflictError } from '../errors/ConflictError'; // <-- add this for duplicate errors

export class MovieService {
  /**
   * Create a new movie.
   * Throws ConflictError if a movie with same title and releaseDate already exists.
   */
  async createMovie(data: MovieAttributes): Promise<MovieModel> {
    const existingMovie = await MovieModel.findOne({
      where: {
        title: data.title,
        releaseDate: data.releaseDate,
      },
    });

    if (existingMovie) {
      throw new ConflictError(
        `Movie with title "${data.title}" and release date "${data.releaseDate.toISOString().split('T')[0]}" already exists.`
      );
    }

    const movie = await MovieModel.create(data);
    return movie;
  }

  /**
   * Retrieve a movie by its ID.
   */
  async getMovieById(movieId: string): Promise<MovieModel> {
    const movie = await MovieModel.findByPk(movieId);
    if (!movie) {
      throw new NotFoundError(`Movie with ID ${movieId} not found.`);
    }
    return movie;
  }

  /**
   * Retrieve all movies.
   */
  async getAllMovies(): Promise<MovieModel[]> {
    const movies = await MovieModel.findAll();
    return movies;
  }

  /**
   * Update a movie by its ID.
   */
  async updateMovie(
    movieId: string,
    updateData: Partial<MovieAttributes>
  ): Promise<MovieModel> {
    const movie = await MovieModel.findByPk(movieId);
    if (!movie) {
      throw new NotFoundError(`Movie with ID ${movieId} not found.`);
    }
    await movie.update(updateData);
    return movie;
  }

  /**
   * Delete a movie by its ID.
   */
  async deleteMovie(movieId: string): Promise<void> {
    const deletedCount = await MovieModel.destroy({ where: { movieId } });
    if (deletedCount === 0) {
      throw new NotFoundError(`Movie with ID ${movieId} not found.`);
    }
  }

  /**
   * Search for movies by filters.
   */
  async searchMovies(filters: {
    title?: string;
    genre?: string;
    director?: string;
    ageRating?: string;
  }): Promise<MovieModel[]> {
    const whereClause: any = {};

    if (filters.title) {
      whereClause.title = { [Op.like]: `%${filters.title}%` };
    }
    if (filters.genre) {
      whereClause.genre = { [Op.like]: `%${filters.genre}%` };
    }
    if (filters.director) {
      whereClause.director = { [Op.like]: `%${filters.director}%` };
    }
    if (filters.ageRating) {
      whereClause.ageRating = filters.ageRating;
    }

    const movies = await MovieModel.findAll({ where: whereClause });
    return movies;
  }
}
