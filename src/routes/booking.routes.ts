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

const bookingRouter = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
bookingRouter.post(
  '/',
  authenticateJwt,
  Permission.isNotStaff(),
  handleCreateBooking
);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       500:
 *         description: Internal server error
 */
bookingRouter.get(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  handleGetAllBookings
);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     tags:
 *       - Bookings
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
 *         description: Booking found
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
bookingRouter.get(
  '/:bookingId',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleGetBookingById
);

/**
 * @swagger
 * /bookings/{bookingId}:
 *   put:
 *     summary: Update a booking
 *     tags:
 *       - Bookings
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
 *         description: Booking updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
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
 *     tags:
 *       - Bookings
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
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
 *     tags:
 *       - Bookings
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
 *       500:
 *         description: Internal server error
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
 *     tags:
 *       - Bookings
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
 *       500:
 *         description: Internal server error
 */
bookingRouter.patch(
  '/:bookingId/cancel',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleCancelBooking
);

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get bookings for a user
 *     tags:
 *       - Bookings
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
 *         description: List of bookings for the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

bookingRouter.get(
  '/user/:userId',
  authenticateJwt,
  Permission.selfOrStaff(),
  handleGetBookingsByUser
);

export default bookingRouter;
