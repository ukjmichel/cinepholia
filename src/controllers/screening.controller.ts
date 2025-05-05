import { Request, Response, NextFunction } from 'express';
import { ScreeningService } from '../services/screening.service';
import { ScreeningAttributes } from '../models/screening.model';

// Singleton instance
export const screeningService = new ScreeningService();

/**
 * Create a new screening
 */
export const handleCreateScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const screeningData: ScreeningAttributes = req.body;
    const screening = await screeningService.createScreening(screeningData);
    res.status(201).json({
      message: 'Screening successfully created',
      data: screening,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a screening by ID
 */
export const handleGetScreeningById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    const screening = await screeningService.getScreeningById(screeningId);

    res.status(200).json({
      message: 'Screening found',
      data: screening,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all screenings
 */
export const handleGetAllScreenings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const screenings = await screeningService.getAllScreenings();

    res.status(200).json({
      message: 'List of screenings retrieved successfully',
      data: screenings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a screening by ID
 */
export const handleUpdateScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    const updateData: Partial<ScreeningAttributes> = req.body;
    const updatedScreening = await screeningService.updateScreening(
      screeningId,
      updateData
    );

    res.status(200).json({
      message: 'Screening successfully updated',
      data: updatedScreening,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a screening by ID
 */
export const handleDeleteScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    await screeningService.deleteScreening(screeningId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Search screenings by theaterId and movieId
 */
export const handleSearchScreenings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId, movieId } = req.query;

    if (!theaterId || !movieId) {
      res.status(400).json({
        error: 'Both theaterId and movieId query parameters are required',
      });
      return;
    }

    const screenings = await screeningService.getScreeningsByTheaterAndMovieId(
      theaterId as string,
      movieId as string
    );

    res.status(200).json({
      message: 'Screenings retrieved successfully',
      data: screenings,
    });
  } catch (error) {
    next(error);
  }
};
