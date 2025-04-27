import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { BookingAttributes } from '../models/booking.model';

// Create a singleton instance of the service
const bookingService = new BookingService();

/**
 * Create a new booking
 * @param req - Express request object with booking data in body
 * @param res - Express response object
 * @param next - Express next function
 */

export const handleCreateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract booking data, but ignore userId coming from body
    const bookingData: Omit<BookingAttributes, 'userId'> = req.body;

    // Force the userId from the authenticated user
    const userId = req.user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ message: 'Unauthorized: user not found in token' });
      return;
    }

    const booking = await bookingService.createBooking({
      ...bookingData,
      userId, // 🛡️ Force userId from token
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      message: 'Failed to create booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Get a booking by ID
 * @param req - Express request object with bookingId in params
 * @param res - Express response object
 * @param next - Express next function
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
    console.error('Error fetching booking:', error);
    res.status(500).json({
      message: 'Failed to fetch booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all bookings
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
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
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      message: 'Failed to fetch bookings',
      error: (error as Error).message,
    });
  }
};

/**
 * Update a booking by ID
 * @param req - Express request object with bookingId in params and update data in body
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleUpdateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const updateData: Partial<BookingAttributes> = req.body;

    const updatedBooking = await bookingService.updateBooking(
      bookingId,
      updateData
    );

    if (!updatedBooking) {
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      message: 'Failed to update booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a booking by ID
 * @param req - Express request object with bookingId in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleDeleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const deleted = await bookingService.deleteBooking(bookingId);

    if (!deleted) {
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      message: 'Failed to delete booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all bookings for a specific user
 * @param req - Express request object with userId in params
 * @param res - Express response object
 * @param next - Express next function
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
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      message: 'Failed to fetch user bookings',
      error: (error as Error).message,
    });
  }
};

/**
 * Mark a booking as used
 * @param req - Express request object with bookingId in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleMarkBookingAsUsed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.markBookingAsUsed(bookingId);

    if (!booking) {
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error marking booking as used:', error);
    res.status(500).json({
      message: 'Failed to mark booking as used',
      error: (error as Error).message,
    });
  }
};

/**
 * Cancel a booking
 * @param req - Express request object with bookingId in params
 * @param res - Express response object
 * @param next - Express next function
 */
export const handleCancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.cancelBooking(bookingId);

    if (!booking) {
      res
        .status(404)
        .json({ message: `Booking with ID ${bookingId} not found` });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({
      message: 'Failed to cancel booking',
      error: (error as Error).message,
    });
  }
};
