import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { BookingAttributes } from '../models/booking.model';
import { ScreeningService } from '../services/screening.service';
import { MovieHallService } from '../services/movieHall.service';

import { BadRequestError } from '../errors/BadRequestError';
import { Transaction } from 'sequelize';
import crypto from 'crypto';
import { sequelize } from '../config/db';
import { SeatBookingService } from '../services/seatBooking.service';
import { NotAuthorizedError } from '../errors/NotAuthorizedError ';

export const screeningService = new ScreeningService();
export const seatBookingService = new SeatBookingService();
export const movieHallService = new MovieHallService();

// Create a singleton instance of the service
const bookingService = new BookingService();

interface ExtendedRequest extends Request {
  user?: any;
  screening?: any;
  seatIds?: string[];
}

/**
 * Create a new booking with seat reservations
 * Expects:
 * - req.user to be set by authentication middleware
 * - req.validatedSeats to be set by seat validation middleware
 * - req.body to contain screeningId, seatsNumber, seatIds
 */
export const handleCreateBooking = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    // Extract booking data, but ignore userId coming from body
    const { screeningId, seatsNumber, seatIds } = req.body;

    // Force the userId from the authenticated user
    const userId = req.user?.id;
    if (!userId) {
      if (transaction) await transaction.rollback();
      throw new NotAuthorizedError('User is not authenticated');
    }

    // Get validated seat IDs from previous middleware or from request body
    if (!seatIds || seatIds.length === 0) {
      if (transaction) await transaction.rollback();
      throw new BadRequestError('No seats selected');
    }

    // Ensure seatsNumber matches the actual number of seats
    const actualSeatsNumber = seatIds.length;
    if (seatsNumber !== actualSeatsNumber) {
      if (transaction) await transaction.rollback();
      throw new BadRequestError('Seats number mismatch');
    }

    // Safety check that transaction exists
    if (!transaction) {
      throw new Error('Transaction failed to initialize');
    }

    // 🔥 Validate both seat existence and availability in parallel
    await Promise.all([
      seatBookingService.checkSeatsExist(screeningId, seatIds, transaction),
      seatBookingService.checkSeatsAvailable(screeningId, seatIds, transaction),
    ]);

    // Generate a unique booking ID
    const bookingId = crypto.randomUUID();

    // Create the booking
    const booking = await bookingService.createBooking(
      {
        bookingId,
        userId,
        screeningId,
        seatsNumber: actualSeatsNumber,
        status: 'pending',
      },
      transaction
    );

    // 🔥 Book each seat in parallel
    const seatBookings = await Promise.all(
      seatIds.map((seatId: string) =>
        seatBookingService.createSeatBooking(
          {
            screeningId,
            seatId,
            bookingId: booking.bookingId,
          },
          transaction as Transaction
        )
      )
    );

    // Commit the transaction if everything succeeded
    await transaction.commit();
    transaction = null; // Set to null after commit to avoid double commit/rollback

    // Return comprehensive booking information
    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      seats: seatBookings,
      totalSeats: seatBookings.length,
    });
  } catch (error) {
    // Rollback the transaction if there was an error and it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    next(error);
  }
};

/**
 * Get a booking by ID
 */
export const handleGetBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings
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
 * Update a booking by ID
 */
export const handleUpdateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;
    const updateData: Partial<BookingAttributes> = req.body;

    // Safety check that transaction exists
    if (!transaction) {
      throw new Error('Transaction failed to initialize');
    }

    const updatedBooking = await bookingService.updateBooking(
      bookingId,
      updateData,
      transaction
    );

    if (!updatedBooking) {
      await transaction.rollback();
      transaction = null;
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    // Commit the transaction
    await transaction.commit();
    transaction = null;

    res.status(200).json(updatedBooking);
  } catch (error) {
    // Rollback the transaction if there was an error and it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    next(error);
  }
};

/**
 * Delete a booking by ID
 */
export const handleDeleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    // Safety check that transaction exists
    if (!transaction) {
      throw new Error('Transaction failed to initialize');
    }

    // First, delete associated seat bookings
    await seatBookingService.deleteSeatBookingsByBookingId(
      bookingId,
      transaction
    );

    // Then delete the booking
    const deleted = await bookingService.deleteBooking(bookingId, transaction);

    if (!deleted) {
      await transaction.rollback();
      transaction = null;
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    // Commit the transaction
    await transaction.commit();
    transaction = null;

    res.status(204).send();
  } catch (error) {
    // Rollback the transaction if there was an error and it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    next(error);
  }
};

/**
 * Get all bookings for a specific user
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
 * Mark a booking as used
 */
export const handleMarkBookingAsUsed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    // Safety check that transaction exists
    if (!transaction) {
      throw new Error('Transaction failed to initialize');
    }

    const booking = await bookingService.markBookingAsUsed(
      bookingId,
      transaction
    );

    if (!booking) {
      await transaction.rollback();
      transaction = null;
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    // Commit the transaction
    await transaction.commit();
    transaction = null;

    res.status(200).json(booking);
  } catch (error) {
    // Rollback the transaction if there was an error and it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    next(error);
  }
};

/**
 * Cancel a booking
 */
export const handleCancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    // Start a transaction
    transaction = await sequelize.transaction();

    const { bookingId } = req.params;

    // Safety check that transaction exists
    if (!transaction) {
      throw new Error('Transaction failed to initialize');
    }

    const booking = await bookingService.cancelBooking(bookingId, transaction);

    if (!booking) {
      await transaction.rollback();
      transaction = null;
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    // Commit the transaction
    await transaction.commit();
    transaction = null;

    res.status(200).json(booking);
  } catch (error) {
    // Rollback the transaction if there was an error and it exists
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    next(error);
  }
};
