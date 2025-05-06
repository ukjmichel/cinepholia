import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { BookingAttributes } from '../models/booking.model';
import { ScreeningService } from '../services/screening.service';
import { MovieHallService } from '../services/movieHall.service';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';
import { Transaction } from 'sequelize';
import crypto from 'crypto';
import { sequelize } from '../config/db';
import { SeatBookingService } from '../services/seatBooking.service';
import { NotAuthorizedError } from '../errors/NotAuthorizedError ';

export const screeningService = new ScreeningService();
export const seatBookingService = new SeatBookingService();
export const movieHallService = new MovieHallService();
export const bookingService = new BookingService();

interface ExtendedRequest extends Request {
  user?: any;
  screening?: any;
  seatIds?: string[];
}

/**
 * Create a new booking along with seat reservations.
 *
 * @description Creates a booking and reserves seats in a single transaction. Requires authenticated user.
 *
 * @param {ExtendedRequest} req - Express request object containing booking data
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleCreateBooking = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const { screeningId, seatsNumber, seatIds } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new NotAuthorizedError('User is not authenticated');
    if (!seatIds || seatIds.length === 0)
      throw new BadRequestError('No seats selected');
    if (seatsNumber !== seatIds.length)
      throw new BadRequestError('Seats number mismatch');

    await Promise.all([
      seatBookingService.checkSeatsExist(screeningId, seatIds, transaction),
      seatBookingService.checkSeatsAvailable(screeningId, seatIds, transaction),
    ]);

    const bookingId = crypto.randomUUID();

    const booking = await bookingService.createBooking(
      {
        bookingId,
        userId,
        screeningId,
        seatsNumber: seatIds.length,
        status: 'pending',
      },
      transaction
    );

    const seatBookings = await Promise.all(
      seatIds.map((seatId:string) =>
        seatBookingService.createSeatBooking(
          { screeningId, seatId, bookingId },
          transaction as Transaction
        )
      )
    );

    await transaction.commit();

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      seats: seatBookings,
      totalSeats: seatBookings.length,
    });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(console.error);
    next(error);
  }
};

/**
 * Retrieve a booking by its ID.
 *
 * @description Fetches a booking based on the provided booking ID.
 *
 * @param {Request} req - Express request object containing bookingId as a URL parameter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleGetBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking)
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all bookings.
 *
 * @description Fetches all existing bookings from the database.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleGetAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a booking by its ID.
 *
 * @description Updates the details of an existing booking.
 *
 * @param {Request} req - Express request object containing bookingId as a URL parameter and update data in the body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleUpdateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;
    const updateData: Partial<BookingAttributes> = req.body;

    const updatedBooking = await bookingService.updateBooking(
      bookingId,
      updateData,
      transaction
    );

    if (!updatedBooking) {
      await transaction.rollback();
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    await transaction.commit();

    res.status(200).json(updatedBooking);
  } catch (error) {
    if (transaction) await transaction.rollback().catch(console.error);
    next(error);
  }
};

/**
 * Delete a booking by its ID along with associated seat reservations.
 *
 * @description Deletes a booking and its related seat bookings atomically.
 *
 * @param {Request} req - Express request object containing bookingId as a URL parameter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleDeleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    await seatBookingService.deleteSeatBookingsByBookingId(
      bookingId,
      transaction
    );

    const deleted = await bookingService.deleteBooking(bookingId, transaction);

    if (!deleted) {
      await transaction.rollback();
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    await transaction.commit();

    res.status(204).send();
  } catch (error) {
    if (transaction) await transaction.rollback().catch(console.error);
    next(error);
  }
};

/**
 * Retrieve all bookings for a specific user.
 *
 * @description Fetches all bookings made by a particular user.
 *
 * @param {Request} req - Express request object containing userId as a URL parameter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleGetBookingsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getBookingsByUserId(userId);

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a booking as used.
 *
 * @description Updates the status of a booking to 'used'.
 *
 * @param {Request} req - Express request object containing bookingId as a URL parameter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleMarkBookingAsUsed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    const booking = await bookingService.markBookingAsUsed(
      bookingId,
      transaction
    );

    if (!booking) {
      await transaction.rollback();
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    await transaction.commit();

    res.status(200).json(booking);
  } catch (error) {
    if (transaction) await transaction.rollback().catch(console.error);
    next(error);
  }
};

/**
 * Cancel an existing booking.
 *
 * @description Updates the status of a booking to 'canceled'.
 *
 * @param {Request} req - Express request object containing bookingId as a URL parameter
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const handleCancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    const booking = await bookingService.cancelBooking(bookingId, transaction);

    if (!booking) {
      await transaction.rollback();
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    await transaction.commit();

    res.status(200).json(booking);
  } catch (error) {
    if (transaction) await transaction.rollback().catch(console.error);
    next(error);
  }
};
