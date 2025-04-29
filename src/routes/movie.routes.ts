import { Router } from 'express';
import {
  handleCreateMovie,
  handleGetMovieById,
  handleGetAllMovies,
  handleUpdateMovie,
  handleDeleteMovie,
  handleSearchMovies,
} from '../controllers/movie.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import validateCreateMovie from '../validators/movie.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';

const router = Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Movie data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               ageRating:
 *                 type: string
 *               genre:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               director:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movie successfully created
 *       500:
 *         description: Failed to create movie
 */
router.post(
  '/',
  validateCreateMovie,
  handleValidationErrors,
  authenticateJwt,
  Permission.authorize('employé'),
  handleCreateMovie
);
router.post(
  '/',
  validateCreateMovie,
  handleValidationErrors,
  authenticateJwt,
  Permission.authorize('employé'),
  handleCreateMovie
);

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Search for movies
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title to search for
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Genre to search for
 *       - in: query
 *         name: ageRating
 *         schema:
 *           type: string
 *         description: Age rating to filter
 *     responses:
 *       200:
 *         description: Movies matching search criteria
 *       500:
 *         description: Failed to search movies
 */
router.get('/search', handleSearchMovies); // <-- moved UP!

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Get a movie by ID
 *     tags:
 *       - Movies
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie
 *     responses:
 *       200:
 *         description: Movie found
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Failed to get movie
 */
router.get('/:movieId', handleGetMovieById);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags:
 *       - Movies
 *     responses:
 *       200:
 *         description: List of movies retrieved
 *       500:
 *         description: Failed to get movies
 */
router.get('/', handleGetAllMovies);

/**
 * @swagger
 * /movies/{movieId}:
 *   put:
 *     summary: Update a movie by ID
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie
 *     requestBody:
 *       description: Movie data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               ageRating:
 *                 type: string
 *               genre:
 *                 type: string
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               director:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *     responses:
 *       200:
 *         description: Movie successfully updated
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Failed to update movie
 */
router.put(
  '/:movieId',
  authenticateJwt,
  Permission.authorize('employé'),
  handleUpdateMovie
);

/**
 * @swagger
 * /movies/{movieId}:
 *   delete:
 *     summary: Delete a movie by ID
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie
 *     responses:
 *       204:
 *         description: Movie successfully deleted
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Failed to delete movie
 */
router.delete(
  '/:movieId',
  authenticateJwt,
  Permission.authorize('employé'),
  handleDeleteMovie
);

export default router;
