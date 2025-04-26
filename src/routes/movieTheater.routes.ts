import { Router } from 'express';
import {
  createMovietheater,
  getMovietheaterById,
  getAllMovieTheaters,
  updateMovietheater,
  deleteMovietheater,
} from '../controllers/movieTheater.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';

const router = Router();

/**
 * @swagger
 * /movie-theaters:
 *   post:
 *     summary: Create a new movie theater
 *     tags:
 *       - MovieTheaters
 *     requestBody:
 *       description: Movie theater data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       500:
 *         description: Failed to create movie theater
 */
router.post(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  createMovietheater
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
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie theater
 *     responses:
 *       200:
 *         description: Movie theater found
 *       404:
 *         description: Movie theater not found
 *       500:
 *         description: Failed to get movie theater
 */
router.get('/:theaterId', getMovietheaterById);

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
 *         description: Failed to get movie theaters
 */
router.get('/', getAllMovieTheaters);

/**
 * @swagger
 * /movie-theaters/{theaterId}:
 *   put:
 *     summary: Update a movie theater by ID
 *     tags:
 *       - MovieTheaters
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie theater
 *     requestBody:
 *       description: Movie theater data to update
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
 *       404:
 *         description: Movie theater not found
 *       500:
 *         description: Failed to update movie theater
 */
router.put(
  '/:theaterId',
  authenticateJwt,
  Permission.authorize('employé'),
  updateMovietheater
);

/**
 * @swagger
 * /movie-theaters/{theaterId}:
 *   delete:
 *     summary: Delete a movie theater by ID
 *     tags:
 *       - MovieTheaters
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the movie theater
 *     responses:
 *       204:
 *         description: Movie theater successfully deleted
 *       404:
 *         description: Movie theater not found
 *       500:
 *         description: Failed to delete movie theater
 */
router.delete(
  '/:theaterId',
  authenticateJwt,
  Permission.authorize('employé'),
  deleteMovietheater
);

export default router;
