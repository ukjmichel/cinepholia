import { Request, Response, NextFunction } from 'express';
import { MovieTheaterService } from '../services/movieTheater.service';

export const movieTheaterService = new MovieTheaterService();

/**
 * Create a new movie theater.
 */
export const createMovieTheater = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movieTheater = await movieTheaterService.createMovieTheater(req.body);
    res.status(201).json({
      message: 'Movie theater successfully created',
      data: movieTheater,
    });
  } catch (error) {
    next(error); // Let global error handler manage it
  }
};

/**
 * Get a movie theater by ID.
 */
export const getMovieTheaterById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const movieTheater =
      await movieTheaterService.getMovieTheaterById(theaterId);
    res.status(200).json({
      message: 'Movie theater found',
      data: movieTheater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all movie theaters.
 */
export const getAllMovieTheaters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movieTheaters = await movieTheaterService.getAllMovieTheaters();
    res.status(200).json({
      message: 'Movie theaters list successfully retrieved',
      data: movieTheaters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a movie theater by ID.
 */
export const updateMovieTheater = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const updatedMovieTheater = await movieTheaterService.updateMovieTheater(
      theaterId,
      req.body
    );
    res.status(200).json({
      message: 'Movie theater successfully updated',
      data: updatedMovieTheater,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a movie theater by ID.
 */
export const deleteMovieTheater = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    await movieTheaterService.deleteMovieTheater(theaterId);
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};
