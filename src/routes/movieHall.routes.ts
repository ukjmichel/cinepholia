import { Router } from 'express';
import {
  createMovieHall,
  getMovieHall,
  getAllMovieHalls,
  updateSeatsLayout,
  deleteMovieHall,
} from '../controllers/movieHall.controller';

import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';

const router = Router();

/**
 * @swagger
 * /movie-halls:
 *   post:
 *     summary: Create a new movie hall
 *     tags:
 *       - MovieHalls
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
 *               - hallId
 *               - seatsLayout
 *             properties:
 *               theaterId:
 *                 type: string
 *               hallId:
 *                 type: string
 *               seatsLayout:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: integer
 *                       - type: string
 *     responses:
 *       201:
 *         description: Movie hall created
 *       500:
 *         description: Failed to create movie hall
 */
router.post(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  createMovieHall
);

/**
 * @swagger
 * /movie-halls/{theaterId}/{hallId}:
 *   get:
 *     summary: Get a specific movie hall
 *     tags:
 *       - MovieHalls
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: hallId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie hall found
 *       404:
 *         description: Movie hall not found
 *       500:
 *         description: Failed to get movie hall
 */
router.get('/:theaterId/:hallId', getMovieHall);

/**
 * @swagger
 * /movie-halls:
 *   get:
 *     summary: Get all movie halls
 *     tags:
 *       - MovieHalls
 *     responses:
 *       200:
 *         description: List of movie halls
 *       500:
 *         description: Failed to get movie halls
 */
router.get('/', getAllMovieHalls);

/**
 * @swagger
 * /movie-halls/{theaterId}/{hallId}:
 *   put:
 *     summary: Update seats layout of a movie hall
 *     tags:
 *       - MovieHalls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: hallId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seatsLayout
 *             properties:
 *               seatsLayout:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: integer
 *                       - type: string
 *     responses:
 *       200:
 *         description: Seats layout updated
 *       404:
 *         description: Movie hall not found
 *       500:
 *         description: Failed to update
 */
router.put(
  '/:theaterId/:hallId',
  authenticateJwt,
  Permission.authorize('employé'),
  updateSeatsLayout
);

/**
 * @swagger
 * /movie-halls/{theaterId}/{hallId}:
 *   delete:
 *     summary: Delete a movie hall
 *     tags:
 *       - MovieHalls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: hallId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Movie hall deleted
 *       404:
 *         description: Movie hall not found
 *       500:
 *         description: Failed to delete movie hall
 */
router.delete(
  '/:theaterId/:hallId',
  authenticateJwt,
  Permission.authorize('employé'),
  deleteMovieHall
);

export default router;
