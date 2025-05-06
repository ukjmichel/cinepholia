import { ScreeningModel, ScreeningAttributes } from '../models/screening.model';
import { MovieModel } from '../models/movie.model';
import { MovieTheaterModel } from '../models/movietheater.model';
import { MovieHallModel } from '../models/movieHall.model';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { Op, Transaction } from 'sequelize';

/**
 * Helper to validate and auto-correct duration format
 * @param duration input string like "2:5:0"
 * @returns corrected string "02:05:00"
 */
function validateAndCorrectDurationFormat(duration: string): string {
  const parts = duration.split(':');

  if (parts.length !== 3) {
    throw new BadRequestError(
      'Invalid durationTime format. Expected "HH:mm:ss"'
    );
  }

  let [hours, minutes, seconds] = parts.map((part) => part.padStart(2, '0'));

  const hourNum = parseInt(hours, 10);
  const minuteNum = parseInt(minutes, 10);
  const secondNum = parseInt(seconds, 10);

  if (
    isNaN(hourNum) ||
    isNaN(minuteNum) ||
    isNaN(secondNum) ||
    hourNum < 0 ||
    hourNum > 23 ||
    minuteNum < 0 ||
    minuteNum > 59 ||
    secondNum < 0 ||
    secondNum > 59
  ) {
    throw new BadRequestError(
      'Invalid durationTime values. Must be valid hours, minutes, and seconds.'
    );
  }

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Service class to manage screenings.
 */
export class ScreeningService {
  /**
   * Create a new screening after verifying:
   * - The movie, theater, and hall exist.
   * - The hall is available (no overlapping screenings) at the requested time.
   *
   * @param data - The screening attributes (movieId, theaterId, hallId, startTime, durationTime)
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<ScreeningModel> - The created screening
   *
   * @throws NotFoundError if the movie, theater, or hall is not found.
   * @throws BadRequestError if another screening already occupies the requested time slot in the same hall.
   */
  async createScreening(
    data: ScreeningAttributes,
    transaction?: Transaction
  ): Promise<ScreeningModel> {
    // ✅ Validate and correct durationTime immediately
    data.durationTime = validateAndCorrectDurationFormat(data.durationTime);

    const newStartTime = new Date(data.startTime); // 📌 parse it once here

    const [movie, theater, hall, screenings] = await Promise.all([
      MovieModel.findByPk(data.movieId, { transaction }),
      MovieTheaterModel.findByPk(data.theaterId, { transaction }),
      MovieHallModel.findOne({
        where: {
          theaterId: data.theaterId,
          hallId: data.hallId,
        },
        transaction,
      }),
      // Fetch all screenings in the same hall and same day
      ScreeningModel.findAll({
        where: {
          theaterId: data.theaterId,
          hallId: data.hallId,
          startTime: {
            [Op.gte]: new Date(
              newStartTime.getFullYear(),
              newStartTime.getMonth(),
              newStartTime.getDate(),
              0,
              0,
              0
            ),
            [Op.lte]: new Date(
              newStartTime.getFullYear(),
              newStartTime.getMonth(),
              newStartTime.getDate(),
              23,
              59,
              59
            ),
          },
        },
        transaction,
      }),
    ]);

    if (!movie) {
      throw new NotFoundError(`Movie with ID ${data.movieId} not found.`);
    }
    if (!theater) {
      throw new NotFoundError(`Theater with ID ${data.theaterId} not found.`);
    }
    if (!hall) {
      throw new NotFoundError(
        `Hall with ID ${data.hallId} in theater ${data.theaterId} not found.`
      );
    }

    const [hours, minutes, seconds] = data.durationTime.split(':').map(Number);
    const newEndTime = new Date(
      newStartTime.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000
    );

    // Check if any existing screening overlaps
    const hasConflict = screenings.some((existing) => {
      const existingStart = new Date(existing.startTime);
      const [exHours, exMinutes, exSeconds] = (existing.durationTime as string)
        .split(':')
        .map(Number);
      const existingEnd = new Date(
        existingStart.getTime() +
          (exHours * 3600 + exMinutes * 60 + exSeconds) * 1000
      );

      return newStartTime < existingEnd && existingStart < newEndTime;
    });

    if (hasConflict) {
      throw new BadRequestError(
        'Another screening is already scheduled in this hall during the selected time slot.'
      );
    }

    // ✅ Create the screening
    return await ScreeningModel.create(data, { transaction });
  }

  /**
   * Get a screening by its ID.
   * @param screeningId - Screening ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<ScreeningModel | null> - Found screening or null
   */
  async getScreeningById(
    screeningId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel | null> {
    return await ScreeningModel.findByPk(screeningId, { transaction });
  }

  /**
   * Get all screenings.
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<ScreeningModel[]> - List of screenings
   */
  async getAllScreenings(transaction?: Transaction): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({ transaction });
  }

  /**
   * Update a screening by its ID.
   * @param screeningId - Screening ID
   * @param updateData - Partial data to update
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<ScreeningModel | null> - Updated screening or null if not found
   */
  async updateScreening(
    screeningId: string,
    updateData: Partial<ScreeningAttributes>,
    transaction?: Transaction
  ): Promise<ScreeningModel | null> {
    const screening = await ScreeningModel.findByPk(screeningId, {
      transaction,
    });
    if (!screening) {
      return null;
    }

    if (updateData.durationTime) {
      updateData.durationTime = validateAndCorrectDurationFormat(
        updateData.durationTime
      );
    }

    await screening.update(updateData, { transaction });
    return screening;
  }

  /**
   * Delete a screening by its ID.
   * @param screeningId - Screening ID
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<boolean> - True if deleted, false if not found
   */
  async deleteScreening(
    screeningId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    const deletedCount = await ScreeningModel.destroy({
      where: { screeningId },
      transaction,
    });
    return deletedCount > 0;
  }

  /**
   * Get screenings by theaterId and movieId.
   * @param theaterId - Theater ID
   * @param movieId - Movie ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<ScreeningModel[]> - List of screenings
   */
  async getScreeningsByTheaterAndMovieId(
    theaterId: string,
    movieId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({
      where: {
        theaterId,
        movieId,
      },
      transaction,
    });
  }

  /**
   * Get screenings by movie ID
   * @param movieId - The movie ID
   * @param transaction - Optional transaction for consistent reads
   * @returns List of screenings for the movie
   */
  async getScreeningsByMovieId(
    movieId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return ScreeningModel.findAll({
      where: { movieId },
      order: [['startTime', 'ASC']],
      transaction,
    });
  }

  /**
   * Get screenings by theater ID
   * @param theaterId - The theater ID
   * @param transaction - Optional transaction for consistent reads
   * @returns List of screenings for the theater
   */
  async getScreeningsByTheaterId(
    theaterId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return ScreeningModel.findAll({
      where: { theaterId },
      order: [['startTime', 'ASC']],
      transaction,
    });
  }
}
