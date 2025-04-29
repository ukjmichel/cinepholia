import { Request, Response, NextFunction } from 'express';
import { ScreeningService } from '../services/screening.service';
import { ScreeningAttributes } from '../models/screening.model';

// Create a singleton instance of the service
export const screeningService = new ScreeningService();

/**
 * Create a new screening
 * @param req - Express request object with screening data in body
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleCreateScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const screeningData: ScreeningAttributes = req.body;
    const screening = await screeningService.createScreening(screeningData);
    res.status(201).json(screening);
  } catch (error) {
    console.error('Error creating screening:', error);
    res.status(500).json({
      message: 'Failed to create screening',
      error: (error as Error).message,
    });
  }
};

/**
 * Get a screening by ID
 * @param req - Express request object with screeningId in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleGetScreeningById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    const screening = await screeningService.getScreeningById(screeningId);

    if (!screening) {
      res
        .status(404)
        .json({ message: `Screening with ID ${screeningId} not found` });
      return;
    }

    res.status(200).json(screening);
  } catch (error) {
    console.error('Error fetching screening:', error);
    res.status(500).json({
      message: 'Failed to fetch screening',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all screenings
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleGetAllScreenings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const screenings = await screeningService.getAllScreenings();
    res.status(200).json(screenings);
  } catch (error) {
    console.error('Error fetching all screenings:', error);
    res.status(500).json({
      message: 'Failed to fetch screenings',
      error: (error as Error).message,
    });
  }
};

/**
 * Update a screening by ID
 * @param req - Express request object with screeningId in params and update data in body
 * @param res - Express response object
 * @param next - Express next function
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

    if (!updatedScreening) {
      res
        .status(404)
        .json({ message: `Screening with ID ${screeningId} not found` });
      return;
    }

    res.status(200).json(updatedScreening);
  } catch (error) {
    console.error('Error updating screening:', error);
    res.status(500).json({
      message: 'Failed to update screening',
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a screening by ID
 * @param req - Express request object with screeningId in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleDeleteScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    const deleted = await screeningService.deleteScreening(screeningId);

    if (!deleted) {
      res
        .status(404)
        .json({ message: `Screening with ID ${screeningId} not found` });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting screening:', error);
    res.status(500).json({
      message: 'Failed to delete screening',
      error: (error as Error).message,
    });
  }
};

export const handleSearchScreenings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const theaterId = req.query.theaterId as string | undefined;
    const movieId = req.query.movieId as string | undefined;

    if (!theaterId || !movieId) {
      res.status(400).json({
        error: 'Missing theaterId or movieId in query parameters',
      });
      return;
    }

    const screenings = await screeningService.getScreeningByTheaterAndMovieId(
      theaterId,
      movieId
    );

    res.status(200).json(screenings);
  } catch (error) {
    console.error('Error searching screenings:', error);
    res.status(500).json({
      error: 'Failed to search screenings',
      detail: (error as Error).message,
    });
  }
};
