import { NextFunction, Request, Response } from 'express';
import { MovieService } from '../services/movie.service';

export const movieService = new MovieService();

/**
 * Create a new movie.
 */
export const handleCreateMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({
      message: 'Movie successfully created',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a movie by ID.
 */
export const handleGetMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction
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
    next(error);
  }
};

/**
 * Get all movies.
 */
export const handleGetAllMovies = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movies = await movieService.getAllMovies();
    res.status(200).json({
      message: 'Movies list successfully retrieved',
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a movie by ID.
 */
export const handleUpdateMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
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
    next(error);
  }
};

/**
 * Delete a movie by ID.
 */
export const handleDeleteMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { movieId } = req.params;
    await movieService.deleteMovie(movieId); // will throw NotFoundError if not found

    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
};

/**
 * Search movies by title, genre, or director.
 */
export const handleSearchMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, genre, director, ageRating } = req.query;
    const searchCriteria: any = {};

    if (title) searchCriteria.title = title;
    if (genre) searchCriteria.genre = genre;
    if (director) searchCriteria.director = director;
    if (ageRating) searchCriteria.ageRating = ageRating;

    const movies = await movieService.searchMovies(searchCriteria);

    res.status(200).json({
      message: 'Search results successfully retrieved',
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};
