import { Request, Response } from 'express';
import { MovieTheaterService } from '../services/movieTheater.service';

export const movieTheaterService = new MovieTheaterService();

/**
 * Create a new movie theater.
 * @param req - Express request
 * @param res - Express response
 */
export const createMovietheater = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const movieTheater = await movieTheaterService.createMovieTheater(req.body);
    res.status(201).json({
      message: 'Movie theater successfully created',
      data: movieTheater,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create movie theater', error });
  }
};

/**
 * Get a movie theater by ID.
 * @param req - Express request
 * @param res - Express response
 */
export const getMovietheaterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const movieTheater = await movieTheaterService.getMovieTheaterById(
      theaterId
    );

    if (!movieTheater) {
      res.status(404).json({ message: 'Movie theater not found' });
      return;
    }

    res
      .status(200)
      .json({ message: 'Movie theater found', data: movieTheater });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movie theater', error });
  }
};

/**
 * Get all movie theaters.
 * @param req - Express request
 * @param res - Express response
 */
export const getAllMovieTheaters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const movieTheaters = await movieTheaterService.getAllMovieTheaters();
    res.status(200).json({
      message: 'Movie theaters list successfully retrieved',
      data: movieTheaters,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movie theaters', error });
  }
};

/**
 * Update a movie theater by ID.
 * @param req - Express request
 * @param res - Express response
 */
export const updateMovietheater = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const updatedMovieTheater = await movieTheaterService.updateMovieTheater(
      theaterId,
      req.body
    );

    if (!updatedMovieTheater) {
      res.status(404).json({ message: 'Movie theater not found' });
      return;
    }

    res
      .status(200)
      .json({
        message: 'Movie theater successfully updated',
        data: updatedMovieTheater,
      });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update movie theater', error });
  }
};

/**
 * Delete a movie theater by ID.
 * @param req - Express request
 * @param res - Express response
 */
export const deleteMovietheater = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const deleted = await movieTheaterService.deleteMovieTheater(theaterId);

    if (!deleted) {
      res.status(404).json({ message: 'Movie theater not found' });
      return;
    }

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete movie theater', error });
  }
};
