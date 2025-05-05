import { Router } from 'express';
import {
  createMovieTheater,
  getMovieTheaterById,
  getAllMovieTheaters,
  updateMovieTheater,
  deleteMovieTheater,
} from '../controllers/movieTheater.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';
import {
  createMovieTheaterValidator,
  updateMovieTheaterValidator,
} from '../validators/movieTheater.validator';

const router = Router();

/**
 * @swagger
 * /movie-theaters:
 *   post:
 *     summary: Create a new movie theater
 *     tags:
 *       - MovieTheaters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theaterId
 *               - address
 *               - postalCode
 *               - city
 *               - phone
 *               - email
 *             properties:
 *               theaterId:
 *                 type: string
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movie theater successfully created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Theater ID already exists
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  createMovieTheaterValidator,
  handleValidationErrors,
  createMovieTheater
);

/**
 * @swagger
 * /movie-theaters/{theaterId}:
 *   get:
 *     summary: Get a movie theater by ID
 *     tags:
 *       - MovieTheaters
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie theater
 *     responses:
 *       200:
 *         description: Movie theater found
 *       404:
 *         description: Movie theater not found
 *       500:
 *         description: Internal server error
 */
router.get('/:theaterId', getMovieTheaterById);

/**
 * @swagger
 * /movie-theaters:
 *   get:
 *     summary: Get all movie theaters
 *     tags:
 *       - MovieTheaters
 *     responses:
 *       200:
 *         description: List of movie theaters retrieved
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllMovieTheaters);

/**
 * @swagger
 * /movie-theaters/{theaterId}:
 *   put:
 *     summary: Update a movie theater by ID
 *     tags:
 *       - MovieTheaters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie theater
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               city:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Movie theater successfully updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie theater not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:theaterId',
  authenticateJwt,
  Permission.authorize('employé'),
  updateMovieTheaterValidator,
  handleValidationErrors,
  updateMovieTheater
);

/**
 * @swagger
 * /movie-theaters/{theaterId}:
 *   delete:
 *     summary: Delete a movie theater by ID
 *     tags:
 *       - MovieTheaters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie theater
 *     responses:
 *       204:
 *         description: Movie theater successfully deleted
 *       404:
 *         description: Movie theater not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:theaterId',
  authenticateJwt,
  Permission.authorize('employé'),
  deleteMovieTheater
);

export default router;
