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
import { isScreeningExist } from '../middlewares/screening.middleware';
import {
  isSeatAvailable,
  isValidSeat,
} from '../middlewares/seatBooking.middleware';
import { validateBookingRequest } from '../validators/booking.validator';

const bookingRouter = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking with seat reservations
 *     description: Creates a booking for a specific screening with selected seats. Authentication required.
 *     tags:
 *       - Bookings
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
 *               - bookingDate
 *               - seatsNumber
 *               - seatId
 *             properties:
 *               screeningId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the screening to book
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the booking (must be in the future)
 *                 example: "2023-12-25T20:00:00Z"
 *               seatsNumber:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of seats to book (must match seatId array length)
 *                 example: 2
 *               seatId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of seat IDs to book
 *                 example: ["A1", "A2"]
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 booking:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     screeningId:
 *                       type: string
 *                       format: uuid
 *                     bookingDate:
 *                       type: string
 *                       format: date-time
 *                     seatsNumber:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, used, canceled]
 *                 seats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       screeningId:
 *                         type: string
 *                         format: uuid
 *                       seatId:
 *                         type: string
 *                       bookingId:
 *                         type: string
 *                         format: uuid
 *                 totalSeats:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: Missing or invalid token"
 *       404:
 *         description: Screening not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No screening with this ID found"
 *                 screeningId:
 *                   type: string
 *                   format: uuid
 *       409:
 *         description: Seat already booked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seat already booked"
 *                 screeningId:
 *                   type: string
 *                   format: uuid
 *                 seatId:
 *                   type: string
 *                   example: "A1"
 *                 details:
 *                   type: string
 *                   example: "This seat has already been booked for this screening"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create booking"
 *                 error:
 *                   type: string
 */
bookingRouter.post(
  '/',
  validateBookingRequest,
  authenticateJwt,
  isScreeningExist,
  isValidSeat,
  isSeatAvailable,
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
