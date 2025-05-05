import { ScreeningModel, ScreeningAttributes } from '../models/screening.model';
import { MovieModel } from '../models/movie.model';
import { MovieTheaterModel } from '../models/movietheater.model';
import { MovieHallModel } from '../models/movieHall.model';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';

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
   * Create a new screening after verifying movie, theater, and hall exist.
   * @param data - The screening attributes
   * @returns Promise<ScreeningModel> - The created screening
   * @throws NotFoundError if movie, theater, or hall is not found
   */
  async createScreening(data: ScreeningAttributes): Promise<ScreeningModel> {
    // Validate related entities in parallel
    const [movie, theater, hall] = await Promise.all([
      MovieModel.findByPk(data.movieId),
      MovieTheaterModel.findByPk(data.theaterId),
      MovieHallModel.findOne({
        where: {
          theaterId: data.theaterId,
          hallId: data.hallId,
        },
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

    // ✅ Auto-correct and validate durationTime
    data.durationTime = validateAndCorrectDurationFormat(data.durationTime);

    // All validations passed
    return await ScreeningModel.create(data);
  }

  /**
   * Get a screening by its ID.
   * @param screeningId - Screening ID
   * @returns Promise<ScreeningModel> - Found screening
   * @throws NotFoundError if not found
   */
  async getScreeningById(screeningId: string): Promise<ScreeningModel> {
    const screening = await ScreeningModel.findByPk(screeningId);
    if (!screening) {
      throw new NotFoundError(`Screening with ID ${screeningId} not found.`);
    }
    return screening;
  }

  /**
   * Get all screenings.
   * @returns Promise<ScreeningModel[]> - List of screenings
   */
  async getAllScreenings(): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll();
  }

  /**
   * Update a screening by its ID.
   * @param screeningId - Screening ID
   * @param updateData - Partial data to update
   * @returns Promise<ScreeningModel> - Updated screening
   * @throws NotFoundError if not found
   */
  async updateScreening(
    screeningId: string,
    updateData: Partial<ScreeningAttributes>
  ): Promise<ScreeningModel> {
    const screening = await ScreeningModel.findByPk(screeningId);
    if (!screening) {
      throw new NotFoundError(`Screening with ID ${screeningId} not found.`);
    }

    if (updateData.durationTime) {
      updateData.durationTime = validateAndCorrectDurationFormat(
        updateData.durationTime
      );
    }

    return await screening.update(updateData);
  }

  /**
   * Delete a screening by its ID.
   * @param screeningId - Screening ID
   * @returns Promise<void>
   * @throws NotFoundError if not found
   */
  async deleteScreening(screeningId: string): Promise<void> {
    const deletedCount = await ScreeningModel.destroy({
      where: { screeningId },
    });
    if (deletedCount === 0) {
      throw new NotFoundError(`Screening with ID ${screeningId} not found.`);
    }
  }

  /**
   * Get screenings by theaterId and movieId.
   * @param theaterId - Theater ID
   * @param movieId - Movie ID
   * @returns Promise<ScreeningModel[]> - List of screenings
   */
  async getScreeningsByTheaterAndMovieId(
    theaterId: string,
    movieId: string
  ): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({
      where: {
        theaterId,
        movieId,
      },
    });
  }
}
