import { Router } from 'express';
import {
  handleCreateScreening,
  handleGetScreeningById,
  handleGetAllScreenings,
  handleUpdateScreening,
  handleDeleteScreening,
  handleSearchScreenings,
} from '../controllers/screening.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import {
  validateScreeningIdParam,
  validateScreeningSearchQuery,
  validateScreeningBody,
} from '../validators/screening.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';

const screeningRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Screenings
 *   description: Endpoints to manage movie screenings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Screening:
 *       type: object
 *       required:
 *         - movieId
 *         - theaterId
 *         - hallId
 *         - startTime
 *         - durationTime
 *       properties:
 *         screeningId:
 *           type: string
 *           format: uuid
 *           description: UUID of the screening
 *         movieId:
 *           type: string
 *           format: uuid
 *           description: UUID of the movie
 *         theaterId:
 *           type: string
 *           description: ID of the theater
 *         hallId:
 *           type: string
 *           description: ID of the hall
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the screening (ISO8601 format)
 *         durationTime:
 *           type: string
 *           pattern: '^([0-1]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$'
 *           description: Duration in format HH:mm:ss
 *       example:
 *         screeningId: "b2c10c4a-1b02-4c78-821f-7c28d81e9437"
 *         movieId: "f8f6d1e0-5e6d-4b60-86c4-6a81a1d4e58a"
 *         theaterId: "theater-123"
 *         hallId: "hall-1"
 *         startTime: "2025-01-01T18:00:00Z"
 *         durationTime: "02:30:00"
 */

/**
 * @swagger
 * /screenings:
 *   post:
 *     summary: Create a new screening
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Screening'
 *     responses:
 *       201:
 *         description: Screening created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
screeningRouter.post(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  validateScreeningBody,
  handleValidationErrors,
  handleCreateScreening
);

/**
 * @swagger
 * /screenings:
 *   get:
 *     summary: Get all screenings
 *     tags: [Screenings]
 *     responses:
 *       200:
 *         description: List of all screenings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 *       500:
 *         description: Server error
 */
screeningRouter.get('/', handleGetAllScreenings);

/**
 * @swagger
 * /screenings/search:
 *   get:
 *     summary: Search screenings by theaterId and movieId
 *     tags: [Screenings]
 *     parameters:
 *       - in: query
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the theater
 *       - in: query
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the movie
 *     responses:
 *       200:
 *         description: List of matching screenings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
screeningRouter.get(
  '/search',
  validateScreeningSearchQuery,
  handleValidationErrors,
  handleSearchScreenings
);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   get:
 *     summary: Get a screening by ID
 *     tags: [Screenings]
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the screening
 *     responses:
 *       200:
 *         description: Screening found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
screeningRouter.get(
  '/:screeningId',
  validateScreeningIdParam,
  handleValidationErrors,
  handleGetScreeningById
);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   put:
 *     summary: Update a screening
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the screening
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Screening'
 *     responses:
 *       200:
 *         description: Screening updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
screeningRouter.put(
  '/:screeningId',
  authenticateJwt,
  Permission.authorize('employé'),
  validateScreeningIdParam,
  validateScreeningBody,
  handleValidationErrors,
  handleUpdateScreening
);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   delete:
 *     summary: Delete a screening
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the screening
 *     responses:
 *       204:
 *         description: Screening deleted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Screening not found
 *       500:
 *         description: Server error
 */
screeningRouter.delete(
  '/:screeningId',
  authenticateJwt,
  Permission.authorize('employé'),
  validateScreeningIdParam,
  handleValidationErrors,
  handleDeleteScreening
);

export default screeningRouter;
