import { MovieHallModel, MovieHallAttributes } from '../models/movieHall.model';

export class MovieHallService {
  /**
   * Create a new movie hall
   * @param data - Movie hall attributes
   * @returns Promise<MovieHallModel> - The created movie hall
   */
  async createMovieHall(data: MovieHallAttributes): Promise<MovieHallModel> {
    const movieHall = await MovieHallModel.create(data);
    return movieHall;
  }

  /**
   * Retrieve a movie hall by theaterId and hallId
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @returns Promise<MovieHallModel | null> - Found movie hall or null
   */
  async getMovieHall(
    theaterId: string,
    hallId: string
  ): Promise<MovieHallModel | null> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
    });
    return movieHall;
  }

  /**
   * Retrieve all movie halls
   * @returns Promise<MovieHallModel[]> - List of movie halls
   */
  async getAllMovieHalls(): Promise<MovieHallModel[]> {
    const movieHalls = await MovieHallModel.findAll();
    return movieHalls;
  }

  /**
   * Update the seats layout of a specific movie hall
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @param seatsLayout - New seats layout
   * @returns Promise<MovieHallModel | null> - Updated movie hall or null
   */
  async updateSeatsLayout(
    theaterId: string,
    hallId: string,
    seatsLayout: (string | number)[][]
  ): Promise<MovieHallModel | null> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
    });

    if (!movieHall) {
      return null;
    }

    movieHall.seatsLayout = seatsLayout;
    await movieHall.save();
    return movieHall;
  }

  /**
   * Delete a movie hall by theaterId and hallId
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteMovieHall(theaterId: string, hallId: string): Promise<boolean> {
    const deletedCount = await MovieHallModel.destroy({
      where: { theaterId, hallId },
    });
    return deletedCount > 0;
  }
}
