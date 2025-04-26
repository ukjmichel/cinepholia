import { Request, Response } from 'express';
import { MovieService } from '../services/movie.service';

export const movieService = new MovieService();

/**
 * Create a new movie.
 * @param req Express request
 * @param res Express response
 */
export const createMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({
      message: 'Movie successfully created',
      data: movie,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create movie', error });
  }
};

/**
 * Get a movie by ID.
 * @param req Express request
 * @param res Express response
 */
export const getMovieById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { movieId } = req.params;
    const movie = await movieService.getMovieById(movieId);

    if (!movie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    res.status(200).json({
      message: 'Movie found',
      data: movie,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movie', error });
  }
};

/**
 * Get all movies.
 * @param req Express request
 * @param res Express response
 */
export const getAllMovies = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const movies = await movieService.getAllMovies();
    res.status(200).json({
      message: 'Movies list successfully retrieved',
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get movies', error });
  }
};

/**
 * Update a movie by ID.
 * @param req Express request
 * @param res Express response
 */
export const updateMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { movieId } = req.params;
    const updatedMovie = await movieService.updateMovie(movieId, req.body);

    if (!updatedMovie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    res.status(200).json({
      message: 'Movie successfully updated',
      data: updatedMovie,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update movie', error });
  }
};

/**
 * Delete a movie by ID.
 * @param req Express request
 * @param res Express response
 */
export const deleteMovie = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { movieId } = req.params;
    const deleted = await movieService.deleteMovie(movieId);

    if (!deleted) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete movie', error });
  }
};
