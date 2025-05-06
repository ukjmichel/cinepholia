import { Router } from 'express';
import {
  handleCreateBooking,
  handleGetBookingById,
  handleGetAllBookings,
  handleUpdateBooking,
  handleDeleteBooking,
  handleMarkBookingAsUsed,
  handleCancelBooking,
  handleGetBookingsByUser,
} from '../controllers/booking.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import { validateBookingRequest } from '../validators/booking.validator';

const bookingRouter = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking with seat reservations
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - screeningId
 *               - seatsNumber
 *               - seatIds
 *             properties:
 *               screeningId:
 *                 type: string
 *                 format: uuid
 *               seatsNumber:
 *                 type: integer
 *               seatIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
bookingRouter.post(
  '/',
  validateBookingRequest,
  authenticateJwt,
  handleCreateBooking
);

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get bookings for a specific user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 */
bookingRouter.get('/user/:userId', authenticateJwt, handleGetBookingsByUser);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
bookingRouter.get('/:bookingId', authenticateJwt, handleGetBookingById);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
bookingRouter.get('/', authenticateJwt, handleGetAllBookings);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, used, canceled]
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       404:
 *         description: Booking not found
 */
bookingRouter.put(
  '/:bookingId',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleUpdateBooking
);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
bookingRouter.delete(
  '/:bookingId',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleDeleteBooking
);

/**
 * @swagger
 * /bookings/{bookingId}/used:
 *   patch:
 *     summary: Mark a booking as used
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking marked as used
 *       404:
 *         description: Booking not found
 */
bookingRouter.patch(
  '/:bookingId/used',
  authenticateJwt,
  Permission.authorize('employé'),
  handleMarkBookingAsUsed
);

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking canceled
 *       404:
 *         description: Booking not found
 */
bookingRouter.patch(
  '/:bookingId/cancel',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleCancelBooking
);

export default bookingRouter;
