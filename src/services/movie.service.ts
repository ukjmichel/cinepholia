import { MovieModel, MovieAttributes } from '../models/movie.model';

export class MovieService {
  /**
   * Create a new movie.
   * @param data - The movie attributes
   * @returns Promise<MovieModel> - The created movie
   */
  async createMovie(data: MovieAttributes): Promise<MovieModel> {
    const movie = await MovieModel.create(data);
    return movie;
  }

  /**
   * Retrieve a movie by its ID.
   * @param movieId - The ID of the movie
   * @returns Promise<MovieModel | null> - The movie or null if not found
   */
  async getMovieById(movieId: string): Promise<MovieModel | null> {
    const movie = await MovieModel.findByPk(movieId);
    return movie;
  }

  /**
   * Retrieve all movies.
   * @returns Promise<MovieModel[]> - List of movies
   */
  async getAllMovies(): Promise<MovieModel[]> {
    const movies = await MovieModel.findAll();
    return movies;
  }

  /**
   * Update a movie by its ID.
   * @param movieId - The ID of the movie
   * @param updateData - The data to update
   * @returns Promise<MovieModel | null> - The updated movie or null if not found
   */
  async updateMovie(
    movieId: string,
    updateData: Partial<MovieAttributes>
  ): Promise<MovieModel | null> {
    const movie = await MovieModel.findByPk(movieId);
    if (!movie) {
      return null;
    }
    await movie.update(updateData);
    return movie;
  }

  /**
   * Delete a movie by its ID.
   * @param movieId - The ID of the movie
   * @returns Promise<boolean> - True if deleted, false otherwise
   */
  async deleteMovie(movieId: string): Promise<boolean> {
    const deletedCount = await MovieModel.destroy({ where: { movieId } });
    return deletedCount > 0;
  }
}
