// src/controllers/seatbooking.controller.ts

import { Request, Response, NextFunction } from 'express';
import { SeatBookingService } from '../services/seatBooking.service';
import { SeatBookingAttributes } from '../models/seatBooking.model';

// Singleton instance of SeatBookingService
const seatBookingService = new SeatBookingService();



/**
 * Create a new seat booking.
 *
 * @route POST /seatbookings
 * @param req - Express Request with seat booking data in body
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 201 Created with the created SeatBooking, or 500 Internal Server Error
 */
export const handleCreateSeatBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const seatBookingData: SeatBookingAttributes = req.body;
    const seatBooking = await seatBookingService.createSeatBooking(
      seatBookingData
    );
    res.status(201).json(seatBooking);
  } catch (error) {
    console.error('Error creating seat booking:', error);
    res.status(500).json({
      message: 'Failed to create seat booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Get a seat booking by screening ID and seat ID.
 *
 * @route GET /seatbookings/:screeningId/:seatId
 * @param req - Express Request with screeningId and seatId params
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 200 OK with SeatBooking, 404 Not Found, or 500 Internal Server Error
 */
export const handleGetSeatBookingByScreeningAndSeat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId, seatId } = req.params;
    const seatBooking =
      await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
        screeningId,
        seatId
      );

    if (!seatBooking) {
      res.status(404).json({
        message: `Seat booking not found for seat ${seatId} in screening ${screeningId}`,
      });
      return;
    }

    res.status(200).json(seatBooking);
  } catch (error) {
    console.error('Error fetching seat booking:', error);
    res.status(500).json({
      message: 'Failed to fetch seat booking',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all seat bookings by booking ID.
 *
 * @route GET /seatbookings/booking/:bookingId
 * @param req - Express Request with bookingId param
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 200 OK with array of SeatBookings or 500 Internal Server Error
 */
export const handleGetSeatBookingsByBookingId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const seatBookings = await seatBookingService.getSeatBookingsByBookingId(
      bookingId
    );

    res.status(200).json(seatBookings);
  } catch (error) {
    console.error('Error fetching seat bookings by bookingId:', error);
    res.status(500).json({
      message: 'Failed to fetch seat bookings',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all seat bookings by screening ID.
 *
 * @route GET /seatbookings/screening/:screeningId
 * @param req - Express Request with screeningId param
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 200 OK with array of SeatBookings or 500 Internal Server Error
 */
export const handleGetSeatBookingsByScreeningId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId } = req.params;
    const seatBookings = await seatBookingService.getSeatBookingsByScreeningId(
      screeningId
    );

    res.status(200).json(seatBookings);
  } catch (error) {
    console.error('Error fetching seat bookings by screeningId:', error);
    res.status(500).json({
      message: 'Failed to fetch seat bookings',
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a seat booking by screening ID and seat ID.
 *
 * @route DELETE /seatbookings/:screeningId/:seatId
 * @param req - Express Request with screeningId and seatId params
 * @param res - Express Response
 * @param next - Express NextFunction
 * @returns 204 No Content on success, 404 Not Found, or 500 Internal Server Error
 */
export const handleDeleteSeatBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { screeningId, seatId } = req.params;
    const deleted = await seatBookingService.deleteSeatBooking(
      screeningId,
      seatId
    );

    if (!deleted) {
      res.status(404).json({
        message: `Seat booking not found for seat ${seatId} in screening ${screeningId}`,
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting seat booking:', error);
    res.status(500).json({
      message: 'Failed to delete seat booking',
      error: (error as Error).message,
    });
  }
};
