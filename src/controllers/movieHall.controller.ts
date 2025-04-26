import { Request, Response } from 'express';
import { MovieHallService } from '../services/movieHall.service';

const movieHallService = new MovieHallService();

/**
 * Create a new movie hall
 * @param req Express request
 * @param res Express response
 */
export const createMovieHall = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const movieHall = await movieHallService.createMovieHall(req.body);
    res.status(201).json({
      message: 'Movie hall successfully created',
      data: movieHall,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create movie hall', error });
  }
};

/**
 * Get a movie hall by theaterId and hallId
 * @param req Express request
 * @param res Express response
 */
export const getMovieHall = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;
    const movieHall = await movieHallService.getMovieHall(theaterId, hallId);

    if (!movieHall) {
      res.status(404).json({ message: 'Movie hall not found' });
      return;
    }

    res.status(200).json({
      message: 'Movie hall found',
      data: movieHall,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movie hall', error });
  }
};

/**
 * Get all movie halls
 * @param req Express request
 * @param res Express response
 */
export const getAllMovieHalls = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const movieHalls = await movieHallService.getAllMovieHalls();
    res.status(200).json({
      message: 'List of movie halls retrieved successfully',
      data: movieHalls,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movie halls', error });
  }
};

/**
 * Update seats layout of a movie hall
 * @param req Express request
 * @param res Express response
 */
export const updateSeatsLayout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;
    const { seatsLayout } = req.body;

    const updatedMovieHall = await movieHallService.updateSeatsLayout(
      theaterId,
      hallId,
      seatsLayout
    );

    if (!updatedMovieHall) {
      res.status(404).json({ message: 'Movie hall not found' });
      return;
    }

    res.status(200).json({
      message: 'Seats layout successfully updated',
      data: updatedMovieHall,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update seats layout', error });
  }
};

/**
 * Delete a movie hall
 * @param req Express request
 * @param res Express response
 */
export const deleteMovieHall = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId, hallId } = req.params;

    const deleted = await movieHallService.deleteMovieHall(theaterId, hallId);

    if (!deleted) {
      res.status(404).json({ message: 'Movie hall not found' });
      return;
    }

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete movie hall', error });
  }
};
