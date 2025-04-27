// src/routes/seatBooking.routes.ts
import { Router } from 'express';
import {
  handleCreateSeatBooking,
  handleGetSeatBookingByScreeningAndSeat,
  handleGetSeatBookingsByBookingId,
  handleGetSeatBookingsByScreeningId,
  handleDeleteSeatBooking,
} from '../controllers/seatBooking.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';

const seatBookingRouter = Router();

/**
 * @swagger
 * /seat-bookings:
 *   post:
 *     summary: Create a new seat booking
 *     description: Books a specific seat for a screening.
 *     operationId: createSeatBooking
 *     tags:
 *       - SeatBookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               screeningId:
 *                 type: string
 *                 description: ID of the screening
 *               seatId:
 *                 type: string
 *                 description: ID of the seat
 *               bookingId:
 *                 type: string
 *                 description: ID of the booking
 *     responses:
 *       201:
 *         description: Seat booked successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
seatBookingRouter.post(
  '/',
  authenticateJwt,
  Permission.isNotStaff(),
  handleCreateSeatBooking
);

/**
 * @swagger
 * /seat-bookings/booking/{bookingId}:
 *   get:
 *     summary: Get all seat bookings by booking ID
 *     tags:
 *       - SeatBookings
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seat bookings
 *       500:
 *         description: Internal server error
 */
seatBookingRouter.get(
  '/booking/:bookingId',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  handleGetSeatBookingsByBookingId
);

/**
 * @swagger
 * /seat-bookings/screening/{screeningId}:
 *   get:
 *     summary: Get all seat bookings by screening ID
 *     tags:
 *       - SeatBookings
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of seat bookings
 *       500:
 *         description: Internal server error
 */
seatBookingRouter.get(
  '/screening/:screeningId',
  handleGetSeatBookingsByScreeningId
);

/**
 * @swagger
 * /seat-bookings/{screeningId}/{seatId}:
 *   get:
 *     summary: Get a seat booking by screening ID and seat ID
 *     tags:
 *       - SeatBookings
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seat booking found
 *       404:
 *         description: Seat booking not found
 *       500:
 *         description: Internal server error
 */
seatBookingRouter.get(
  '/:screeningId/:seatId',
  handleGetSeatBookingByScreeningAndSeat
);

/**
 * @swagger
 * /seat-bookings/{screeningId}/{seatId}:
 *   delete:
 *     summary: Delete a seat booking
 *     tags:
 *       - SeatBookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: screeningId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Seat booking deleted successfully
 *       404:
 *         description: Seat booking not found
 *       500:
 *         description: Internal server error
 */
seatBookingRouter.delete(
  '/:screeningId/:seatId',
  authenticateJwt,
  Permission.authorize('employé'),
  handleDeleteSeatBooking
);

export default seatBookingRouter;
