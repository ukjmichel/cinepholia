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
   * Create a new screening after checking for movie, theater, hall existence and time conflicts.
   */
  async createScreening(
    data: ScreeningAttributes,
    transaction?: Transaction
  ): Promise<ScreeningModel> {
    data.durationTime = validateAndCorrectDurationFormat(data.durationTime);
    const newStartTime = new Date(data.startTime);

    const startOfDay = new Date(
      newStartTime.getFullYear(),
      newStartTime.getMonth(),
      newStartTime.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      newStartTime.getFullYear(),
      newStartTime.getMonth(),
      newStartTime.getDate(),
      23,
      59,
      59
    );

    const [movie, theater, hall, screenings] = await Promise.all([
      MovieModel.findByPk(data.movieId, { transaction }),
      MovieTheaterModel.findByPk(data.theaterId, { transaction }),
      MovieHallModel.findOne({
        where: { theaterId: data.theaterId, hallId: data.hallId },
        transaction,
      }),
      ScreeningModel.findAll({
        where: {
          theaterId: data.theaterId,
          hallId: data.hallId,
          startTime: { [Op.gte]: startOfDay, [Op.lte]: endOfDay },
        },
        transaction,
      }),
    ]);

    if (!movie)
      throw new NotFoundError(`Movie with ID ${data.movieId} not found.`);
    if (!theater)
      throw new NotFoundError(`Theater with ID ${data.theaterId} not found.`);
    if (!hall)
      throw new NotFoundError(
        `Hall with ID ${data.hallId} in theater ${data.theaterId} not found.`
      );

    const [hours, minutes, seconds] = data.durationTime.split(':').map(Number);
    const newEndTime = new Date(
      newStartTime.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000
    );

    const hasConflict = screenings.some((existing) => {
      const existingStart = new Date(existing.startTime);
      const [exHours, exMinutes, exSeconds] = existing.durationTime
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

    return await ScreeningModel.create(data, { transaction });
  }

  /**
   * Get a screening by its ID.
   */
  async getScreeningById(
    screeningId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel> {
    const screening = await ScreeningModel.findByPk(screeningId, {
      transaction,
    });
    if (!screening) {
      throw new NotFoundError('Screening not found');
    }
    return screening;
  }

  /**
   * Get all screenings.
   */
  async getAllScreenings(transaction?: Transaction): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({ transaction });
  }

  /**
   * Update a screening by its ID and check for time conflicts if relevant fields change.
   */
  async updateScreening(
    screeningId: string,
    updateData: Partial<ScreeningAttributes>,
    transaction?: Transaction
  ): Promise<ScreeningModel> {
    const screening = await ScreeningModel.findByPk(screeningId, {
      transaction,
    });
    if (!screening) {
      throw new NotFoundError('Screening not found');
    }

    if (updateData.durationTime) {
      updateData.durationTime = validateAndCorrectDurationFormat(
        updateData.durationTime
      );
    }

    const needsConflictCheck =
      updateData.startTime ||
      updateData.durationTime ||
      updateData.hallId ||
      updateData.theaterId;

    if (needsConflictCheck) {
      const hallId = updateData.hallId ?? screening.hallId;
      const theaterId = updateData.theaterId ?? screening.theaterId;
      const startTime = new Date(updateData.startTime ?? screening.startTime);
      const duration = updateData.durationTime ?? screening.durationTime;

      const [hours, minutes, seconds] = duration.split(':').map(Number);
      const endTime = new Date(
        startTime.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000
      );

      const screenings = await ScreeningModel.findAll({
        where: {
          screeningId: { [Op.ne]: screeningId },
          theaterId,
          hallId,
          startTime: {
            [Op.gte]: new Date(
              startTime.getFullYear(),
              startTime.getMonth(),
              startTime.getDate(),
              0,
              0,
              0
            ),
            [Op.lte]: new Date(
              startTime.getFullYear(),
              startTime.getMonth(),
              startTime.getDate(),
              23,
              59,
              59
            ),
          },
        },
        transaction,
      });

      const hasConflict = screenings.some((existing) => {
        const existingStart = new Date(existing.startTime);
        const [exH, exM, exS] = existing.durationTime.split(':').map(Number);
        const existingEnd = new Date(
          existingStart.getTime() + (exH * 3600 + exM * 60 + exS) * 1000
        );
        return startTime < existingEnd && existingStart < endTime;
      });

      if (hasConflict) {
        throw new BadRequestError(
          'Another screening is already scheduled in this hall during the selected time slot.'
        );
      }
    }

    await screening.update(updateData, { transaction });
    return screening;
  }

  /**
   * Delete a screening by its ID.
   */
  async deleteScreening(
    screeningId: string,
    transaction?: Transaction
  ): Promise<void> {
    const deletedCount = await ScreeningModel.destroy({
      where: { screeningId },
      transaction,
    });
    if (deletedCount === 0) {
      throw new NotFoundError('Screening not found');
    }
  }

  /**
   * Get screenings by theater and movie.
   */
  async getScreeningsByTheaterAndMovieId(
    theaterId: string,
    movieId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({
      where: { theaterId, movieId },
      transaction,
    });
  }

  /**
   * Get screenings by movie ID.
   */
  async getScreeningsByMovieId(
    movieId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({
      where: { movieId },
      order: [['startTime', 'ASC']],
      transaction,
    });
  }

  /**
   * Get screenings by theater ID.
   */
  async getScreeningsByTheaterId(
    theaterId: string,
    transaction?: Transaction
  ): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll({
      where: { theaterId },
      order: [['startTime', 'ASC']],
      transaction,
    });
  }
}
