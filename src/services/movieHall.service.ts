import { MovieHallModel, MovieHallAttributes } from '../models/movieHall.model';
import { ConflictError } from '../errors/ConflictError';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';
import { Transaction } from 'sequelize';

export class MovieHallService {
  /**
   * Create a new movie hall
   * @param data - Movie hall attributes
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<MovieHallModel> - The created movie hall
   */
  async createMovieHall(
    data: MovieHallAttributes,
    transaction?: Transaction
  ): Promise<MovieHallModel> {
    try {
      const movieHall = await MovieHallModel.create(data, { transaction });
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
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<MovieHallModel> - Found movie hall
   */
  async getMovieHall(
    theaterId: string,
    hallId: string,
    transaction?: Transaction
  ): Promise<MovieHallModel> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
      transaction,
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
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<MovieHallModel[]> - List of movie halls
   */
  async getAllMovieHalls(transaction?: Transaction): Promise<MovieHallModel[]> {
    return MovieHallModel.findAll({
      order: [['createdAt', 'DESC']], // Newest first
      transaction,
    });
  }

  /**
   * Update the seats layout of a specific movie hall
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @param seatsLayout - New seats layout
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<MovieHallModel> - Updated movie hall
   */
  async updateSeatsLayout(
    theaterId: string,
    hallId: string,
    seatsLayout: (string | number)[][],
    transaction?: Transaction
  ): Promise<MovieHallModel> {
    const movieHall = await MovieHallModel.findOne({
      where: { theaterId, hallId },
      transaction,
    });

    if (!movieHall) {
      throw new NotFoundError(
        `Movie hall with theaterId ${theaterId} and hallId ${hallId} not found.`
      );
    }

    movieHall.seatsLayout = seatsLayout;
    await movieHall.save({ transaction });
    return movieHall;
  }

  /**
   * Delete a movie hall by theaterId and hallId
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<void> - Nothing if success, throws if not found
   */
  async deleteMovieHall(
    theaterId: string,
    hallId: string,
    transaction?: Transaction
  ): Promise<void> {
    const deletedCount = await MovieHallModel.destroy({
      where: { theaterId, hallId },
      transaction,
    });

    if (deletedCount === 0) {
      throw new NotFoundError(
        `Movie hall with theaterId ${theaterId} and hallId ${hallId} not found.`
      );
    }
  }

  /**
   * Check if a movie hall exists without throwing an error
   * @param theaterId - Theater ID
   * @param hallId - Hall ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<boolean> - True if exists, false otherwise
   */
  async movieHallExists(
    theaterId: string,
    hallId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    const count = await MovieHallModel.count({
      where: { theaterId, hallId },
      transaction,
    });
    return count > 0;
  }
}
