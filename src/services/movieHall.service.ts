import { MovieHallModel, MovieHallAttributes } from '../models/movieHall.model';
import { ConflictError } from '../errors/ConflictError';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

export class MovieHallService {
  /**
   * Create a new movie hall
   * @param data - Movie hall attributes
   * @returns Promise<MovieHallModel> - The created movie hall
   */
  async createMovieHall(data: MovieHallAttributes): Promise<MovieHallModel> {
    try {
      const movieHall = await MovieHallModel.create(data);
      return movieHall;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictError(
          'Movie hall with this theaterId and hallId already exists.'
        );
      }
      if (error.name === 'SequelizeValidationError') {
        throw new BadRequestError(
          error.errors[0]?.message || 'Validation error.'
        );
      }
      throw error;
    }
  }

  /**
   * Retrieve a movie hall by theaterId and hallId
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @returns Promise<MovieHallModel> - Found movie hall
   */
  async getMovieHall(
    theaterId: string,
    hallId: string
  ): Promise<MovieHallModel> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
    });

    if (!movieHall) {
      throw new NotFoundError(
        `Movie hall with theaterId ${theaterId} and hallId ${hallId} not found.`
      );
    }

    return movieHall;
  }

  /**
   * Retrieve all movie halls
   * @returns Promise<MovieHallModel[]> - List of movie halls
   */
  async getAllMovieHalls(): Promise<MovieHallModel[]> {
    return MovieHallModel.findAll({
      order: [['createdAt', 'DESC']], // Newest first
    });
  }

  /**
   * Update the seats layout of a specific movie hall
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @param seatsLayout - New seats layout
   * @returns Promise<MovieHallModel> - Updated movie hall
   */
  async updateSeatsLayout(
    theaterId: string,
    hallId: string,
    seatsLayout: (string | number)[][]
  ): Promise<MovieHallModel> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
    });

    if (!movieHall) {
      throw new NotFoundError(
        `Movie hall with theaterId ${theaterId} and hallId ${hallId} not found.`
      );
    }

    movieHall.seatsLayout = seatsLayout;
    await movieHall.save();
    return movieHall;
  }

  /**
   * Delete a movie hall by theaterId and hallId
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @returns Promise<void> - Nothing if success, throws if not found
   */
  async deleteMovieHall(theaterId: string, hallId: string): Promise<void> {
    const deletedCount = await MovieHallModel.destroy({
      where: { theaterId, hallId },
    });

    if (deletedCount === 0) {
      throw new NotFoundError(
        `Movie hall with theaterId ${theaterId} and hallId ${hallId} not found.`
      );
    }
  }
}
