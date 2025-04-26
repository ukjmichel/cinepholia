import { Router } from 'express';
import {
  createMovie,
  getMovieById,
  getAllMovies,
  updateMovie,
  deleteMovie,
} from '../controllers/movie.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';

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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               age:
 *                 type: string
 *               genre:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Movie successfully created
 *       500:
 *         description: Failed to create movie
 */
router.post('/', authenticateJwt, Permission.authorize('employé'), createMovie);

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
router.get('/:movieId', getMovieById);

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
router.get('/', getAllMovies);

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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               age:
 *                 type: string
 *               genre:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
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
  updateMovie
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
  deleteMovie
);

export default router;
