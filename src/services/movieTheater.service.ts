import {
  MovieTheaterModel,
  MovieTheaterAttributes,
} from '../models/movietheater.model';

export class MovieTheaterService {
  /**
   * Create a new movie theater.
   * @param data - The movie theater attributes
   * @returns Promise<MovieTheaterModel> - The created movie theater
   */
  async createMovieTheater(
    data: MovieTheaterAttributes
  ): Promise<MovieTheaterModel> {
    const movieTheater = await MovieTheaterModel.create(data);
    return movieTheater;
  }
  /**
   * Retrieve a movie theater by its ID.
   * @param theaterId - The ID of the movie theater
   * @returns Promise<MovieTheaterModel|null> - The movie theater or nul if not found
   */
  async getMovieTheaterById(
    theaterId: string
  ): Promise<MovieTheaterModel | null> {
    const movieTheater = await MovieTheaterModel.findByPk(theaterId);
    return movieTheater;
  }
  /**
   * Retrieve all movie theaters.
   * @returns Promise<MovieTheatersModel[]> - a  list of movie theaters
   */
  async getAllMovieTheaters(): Promise<MovieTheaterModel[]> {
    const movieTheaters = await MovieTheaterModel.findAll();
    return movieTheaters;
  }
  /**
   * Update movie theaters by its ID.
   * @param theaterId - the ID of the movie theater
   * @returns Promise<MovieTheaterModel | null> - The updated movie theater or null if not found
   */
  async updateMovieTheater(
    theaterId: string,
    updateData: Partial<MovieTheaterAttributes>
  ) {
    const movieTheater = await MovieTheaterModel.findByPk(theaterId);
    if (!movieTheater) {
      return null;
    }
    await movieTheater.update(updateData);
    return movieTheater;
  }
  /**
   * Delete a movie theater by its ID
   * @param theaterId - the Id of the movie theater
   * @return Provise<boolean> - True if deletion was successful, false otherwise
   */
  async deleteMovieTheater(theaterId: string): Promise<Boolean> {
    const deleteCount = await MovieTheaterModel.destroy({
      where: { theaterId },
    });
    return deleteCount > 0;
  }
}


