// src/routes/screening.routes.ts
import { Router } from 'express';
import {
  handleCreateScreening,
  handleGetScreeningById,
  handleGetAllScreenings,
  handleUpdateScreening,
  handleDeleteScreening,
} from '../controllers/screening.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';

const screeningRouter = Router();

/**
 * @swagger
 * /screenings:
 *   post:
 *     summary: Create a new screening
 *     description: Creates a new movie screening with the provided details.
 *     operationId: createScreening
 *     tags:
 *       - Screenings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: The ID of the movie
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               theaterId:
 *                 type: string
 *                 description: The ID of the theater
 *                 example: 123e4567-e89b-12d3-a456-555555555555
 *               hallId:
 *                 type: string
 *                 description: The ID of the hall in the theater
 *                 example: 123e4567-e89b-12d3-a456-666666666666
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: The start time of the screening
 *                 example: 2025-05-01T18:00:00Z
 *               durationTime:
 *                 type: string
 *                 format: time
 *                 description: The duration of the screening (time only)
 *                 example: 02:30:00
 *     responses:
 *       201:
 *         description: Screening created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screeningId:
 *                   type: string
 *                   description: The unique ID of the newly created screening
 *                   example: 123e4567-e89b-12d3-a456-426614174001
 *                 movieId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 theaterId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-555555555555
 *                 hallId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-666666666666
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-01T18:00:00Z
 *                 durationTime:
 *                   type: string
 *                   format: time
 *                   example: 02:30:00
 *       400:
 *         description: Bad request, validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, insufficient permissions
 *       500:
 *         description: Internal server error
 */
screeningRouter.post(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  handleCreateScreening
);

/**
 * @swagger
 * /screenings:
 *   get:
 *     summary: Get all screenings
 *     description: Retrieves all movie screenings.
 *     operationId: getAllScreenings
 *     tags:
 *       - Screenings
 *     responses:
 *       200:
 *         description: List of screenings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   screeningId:
 *                     type: string
 *                     description: The unique ID of the screening
 *                     example: 123e4567-e89b-12d3-a456-426614174001
 *                   movieId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174000
 *                   theaterId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-555555555555
 *                   hallId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-666666666666
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-05-01T18:00:00Z
 *                   durationTime:
 *                     type: string
 *                     format: time
 *                     example: 02:30:00
 *       500:
 *         description: Internal server error
 */
screeningRouter.get('/', handleGetAllScreenings);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   get:
 *     summary: Get screening by ID
 *     description: Retrieves a screening's information by its unique ID.
 *     operationId: getScreeningById
 *     tags:
 *       - Screenings
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         description: The unique ID of the screening to retrieve
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Screening retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screeningId:
 *                   type: string
 *                   description: The unique ID of the screening
 *                   example: 123e4567-e89b-12d3-a456-426614174001
 *                 movieId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 theaterId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-555555555555
 *                 hallId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-666666666666
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-01T18:00:00Z
 *                 durationTime:
 *                   type: string
 *                   format: time
 *                   example: 02:30:00
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Internal server error
 */
screeningRouter.get('/:screeningId', handleGetScreeningById);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   put:
 *     summary: Update screening information
 *     description: Updates a screening's details.
 *     operationId: updateScreening
 *     tags:
 *       - Screenings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         description: The unique ID of the screening to update
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: The ID of the movie
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               theaterId:
 *                 type: string
 *                 description: The ID of the theater
 *                 example: 123e4567-e89b-12d3-a456-555555555555
 *               hallId:
 *                 type: string
 *                 description: The ID of the hall in the theater
 *                 example: 123e4567-e89b-12d3-a456-666666666666
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: The start time of the screening
 *                 example: 2025-05-01T19:00:00Z
 *               durationTime:
 *                 type: string
 *                 format: time
 *                 description: The duration of the screening (time only)
 *                 example: 02:45:00
 *     responses:
 *       200:
 *         description: Screening updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screeningId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174001
 *                 movieId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 theaterId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-555555555555
 *                 hallId:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-666666666666
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-01T19:00:00Z
 *                 durationTime:
 *                   type: string
 *                   format: time
 *                   example: 02:45:00
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Internal server error
 */
screeningRouter.put(
  '/:screeningId',
  authenticateJwt,
  Permission.authorize('employé'),
  handleUpdateScreening
);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   delete:
 *     summary: Delete screening
 *     description: Deletes a screening from the system.
 *     operationId: deleteScreening
 *     tags:
 *       - Screenings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         description: The unique ID of the screening to delete
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       204:
 *         description: Screening deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Internal server error
 */
screeningRouter.delete(
  '/:screeningId',
  authenticateJwt,
  Permission.authorize('employé'),
  handleDeleteScreening
);

export default screeningRouter;
