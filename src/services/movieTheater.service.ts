import {
  MovieTheaterModel,
  MovieTheaterAttributes,
} from '../models/movietheater.model';
import { ConflictError } from '../errors/ConflictError';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';

export class MovieTheaterService {
  /**
   * Create a new movie theater.
   * @param data - The movie theater attributes
   * @returns The created movie theater.
   */
  async createMovieTheater(
    data: MovieTheaterAttributes
  ): Promise<MovieTheaterModel> {
    try {
      const movieTheater = await MovieTheaterModel.create(data);
      return movieTheater;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictError(
          'Movie theater with this theaterId already exists.'
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
   * Retrieve a movie theater by its ID.
   * @param theaterId - The ID of the movie theater.
   * @returns The movie theater.
   * @throws NotFoundError if not found.
   */
  async getMovieTheaterById(theaterId: string): Promise<MovieTheaterModel> {
    const movieTheater = await MovieTheaterModel.findByPk(theaterId);
    if (!movieTheater) {
      throw new NotFoundError(`Movie theater with ID ${theaterId} not found.`);
    }
    return movieTheater;
  }

  /**
   * Retrieve all movie theaters.
   * @returns A list of movie theaters.
   */
  async getAllMovieTheaters(): Promise<MovieTheaterModel[]> {
    return MovieTheaterModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Update a movie theater by its ID.
   * @param theaterId - The ID of the movie theater.
   * @param updateData - Partial attributes to update.
   * @returns The updated movie theater.
   * @throws NotFoundError if not found.
   */
  async updateMovieTheater(
    theaterId: string,
    updateData: Partial<MovieTheaterAttributes>
  ): Promise<MovieTheaterModel> {
    const movieTheater = await MovieTheaterModel.findByPk(theaterId);
    if (!movieTheater) {
      throw new NotFoundError(`Movie theater with ID ${theaterId} not found.`);
    }
    await movieTheater.update(updateData);
    return movieTheater;
  }

  /**
   * Delete a movie theater by its ID.
   * @param theaterId - The ID of the movie theater.
   * @throws NotFoundError if not found.
   */
  async deleteMovieTheater(theaterId: string): Promise<void> {
    const deleteCount = await MovieTheaterModel.destroy({
      where: { theaterId },
    });
    if (deleteCount === 0) {
      throw new NotFoundError(`Movie theater with ID ${theaterId} not found.`);
    }
  }
}
