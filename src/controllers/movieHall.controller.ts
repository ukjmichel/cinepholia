import { Request, Response, NextFunction } from 'express';
import { MovieHallService } from '../services/movieHall.service';

const movieHallService = new MovieHallService();

/**
 * Create a new movie hall
 */
export const createMovieHall = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movieHall = await movieHallService.createMovieHall(req.body);
    res.status(201).json({
      message: 'Movie hall successfully created',
      data: movieHall,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a movie hall by theaterId and hallId
 */
export const getMovieHall = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;
    const movieHall = await movieHallService.getMovieHall(theaterId, hallId);

    res.status(200).json({
      message: 'Movie hall found',
      data: movieHall,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all movie halls
 */
export const getAllMovieHalls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movieHalls = await movieHallService.getAllMovieHalls();
    res.status(200).json({
      message: 'List of movie halls retrieved successfully',
      data: movieHalls,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update seats layout of a movie hall
 */
export const updateSeatsLayout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;
    const { seatsLayout } = req.body;

    const updatedMovieHall = await movieHallService.updateSeatsLayout(
      theaterId,
      hallId,
      seatsLayout
    );

    res.status(200).json({
      message: 'Seats layout successfully updated',
      data: updatedMovieHall,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a movie hall
 */
export const deleteMovieHall = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;

    await movieHallService.deleteMovieHall(theaterId, hallId);

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};
