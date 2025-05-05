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
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';
import {
  validateCreateMovie,
  validateUpdateMovie,
  validateMovieIdParam,
  validateSearchQuery,
} from '../validators/movie.validator';

const router = Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
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
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: director
 *         schema:
 *           type: string
 *       - in: query
 *         name: ageRating
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  '/search',
  validateSearchQuery,
  handleValidationErrors,
  handleSearchMovies
);

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to retrieve
 *     responses:
 *       200:
 *         description: Movie found
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:movieId',
  validateMovieIdParam,
  handleValidationErrors,
  handleGetMovieById
);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 *       500:
 *         description: Internal server error
 */
router.get('/', handleGetAllMovies);

/**
 * @swagger
 * /movies/{movieId}:
 *   put:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:movieId',
  validateMovieIdParam,
  validateUpdateMovie,
  handleValidationErrors,
  authenticateJwt,
  Permission.authorize('employé'),
  handleUpdateMovie
);

/**
 * @swagger
 * /movies/{movieId}:
 *   delete:
 *     summary: Delete a movie by ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to delete
 *     responses:
 *       204:
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:movieId',
  validateMovieIdParam,
  handleValidationErrors,
  authenticateJwt,
  Permission.authorize('employé'),
  handleDeleteMovie
);

export default router;
