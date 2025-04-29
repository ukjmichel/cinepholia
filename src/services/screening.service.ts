import { ScreeningModel, ScreeningAttributes } from '../models/screening.model';

export class ScreeningService {
  /**
   * Create a new screening.
   * @param data - The screening attributes
   * @returns Promise<ScreeningModel> - The created screening
   */
  async createScreening(data: ScreeningAttributes): Promise<ScreeningModel> {
    return await ScreeningModel.create(data);
  }

  /**
   * Get a screening by ID.
   * @param screeningId - The ID of the screening
   * @returns Promise<ScreeningModel | null> - The found screening or null
   */
  async getScreeningById(screeningId: string): Promise<ScreeningModel | null> {
    return await ScreeningModel.findByPk(screeningId);
  }

  /**
   * Get all screenings.
   * @returns Promise<ScreeningModel[]> - List of screenings
   */
  async getAllScreenings(): Promise<ScreeningModel[]> {
    return await ScreeningModel.findAll();
  }

  /**
   * Update a screening by ID.
   * @param screeningId - The ID of the screening
   * @param updateData - Partial attributes to update
   * @returns Promise<ScreeningModel | null> - The updated screening or null if not found
   */
  async updateScreening(
    screeningId: string,
    updateData: Partial<ScreeningAttributes>
  ): Promise<ScreeningModel | null> {
    const screening = await ScreeningModel.findByPk(screeningId);
    if (!screening) {
      return null;
    }

    return await screening.update(updateData);
  }

  /**
   * Delete a screening by ID.
   * @param screeningId - The ID of the screening
   * @returns Promise<boolean> - True if deleted, false otherwise
   */
  async deleteScreening(screeningId: string): Promise<boolean> {
    const deleted = await ScreeningModel.destroy({
      where: { screeningId },
    });
    return deleted > 0;
  }

  /**
   * Delete a screening by ID.
   * @param theaterId - The ID of the screening
   * @param movieId - Tthe ID of the movie
   * @returns Promise<ScreeningModel[]> - List of matching screenings
   */
  async getScreeningByTheaterAndMovieId(
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
