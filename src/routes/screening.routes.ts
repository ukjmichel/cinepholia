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
 * /screenings:
 *   post:
 *     summary: Create a new screening
 *     description: Create a new movie screening. Only employees can create screenings.
 *     tags: [Screenings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - theaterId
 *               - hallId
 *               - startTime
 *               - durationTime
 *             properties:
 *               movieId:
 *                 type: string
 *               theaterId:
 *                 type: string
 *               hallId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               durationTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Screening created successfully
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
  handleCreateScreening
);

/**
 * @swagger
 * /screenings:
 *   get:
 *     summary: Get all screenings
 *     description: Retrieve a list of all screenings.
 *     tags: [Screenings]
 *     responses:
 *       200:
 *         description: A list of screenings
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
 *     summary: Search screenings by theater and movie
 *     description: Search screenings by theater ID and movie ID.
 *     tags: [Screenings]
 *     parameters:
 *       - in: query
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the theater
 *       - in: query
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the movie
 *     responses:
 *       200:
 *         description: A list of matching screenings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error (invalid UUID)
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
 *     description: Retrieve a specific screening by its ID.
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
 *         description: Validation error (invalid UUID)
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
 *     description: Update the details of an existing screening. Only employees can update screenings.
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
 *         description: UUID of the screening to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *               theaterId:
 *                 type: string
 *               hallId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               durationTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Screening updated successfully
 *       400:
 *         description: Validation error (invalid UUID)
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
  handleValidationErrors,
  handleUpdateScreening
);

/**
 * @swagger
 * /screenings/{screeningId}:
 *   delete:
 *     summary: Delete a screening
 *     description: Delete a screening by ID. Only employees can delete screenings.
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
 *         description: UUID of the screening to delete
 *     responses:
 *       204:
 *         description: Screening deleted successfully
 *       400:
 *         description: Validation error (invalid UUID)
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
