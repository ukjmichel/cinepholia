// src/services/seatBooking.service.ts

import {
  SeatBookingModel,
  SeatBookingAttributes,
} from '../models/seatBooking.model';
import { MovieHallService } from './movieHall.service';
import { ScreeningService } from './screening.service';
import { BadRequestError } from '../errors/BadRequestError';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { Transaction } from 'sequelize';

// Import these to fix the undefined ScreeningModel error
import { ScreeningModel } from '../models/screening.model';

// Create instances of the required services
const movieHallService = new MovieHallService();
const screeningService = new ScreeningService();

export class SeatBookingService {
  /**
   * Create a new seat booking.
   * @param data - The seat booking attributes
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<SeatBookingModel> - The created seat booking
   */
  async createSeatBooking(
    data: SeatBookingAttributes,
    transaction?: Transaction
  ): Promise<SeatBookingModel> {
    return await SeatBookingModel.create(data, { transaction });
  }

  /**
   * Get a seat booking by screeningId and seatId.
   * @param screeningId - Screening ID
   * @param seatId - Seat ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<SeatBookingModel | null>
   */
  async getSeatBookingByScreeningIdAndSeatId(
    screeningId: string,
    seatId: string,
    transaction?: Transaction
  ): Promise<SeatBookingModel | null> {
    return await SeatBookingModel.findOne({
      where: { screeningId, seatId },
      transaction,
    });
  }

  /**
   * Get all seat bookings by bookingId.
   * @param bookingId - Booking ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<SeatBookingModel[]>
   */
  async getSeatBookingsByBookingId(
    bookingId: string,
    transaction?: Transaction
  ): Promise<SeatBookingModel[]> {
    return await SeatBookingModel.findAll({
      where: { bookingId },
      transaction,
    });
  }

  /**
   * Get all seat bookings by screeningId.
   * @param screeningId - Screening ID
   * @param transaction - Optional transaction for consistent reads
   * @returns Promise<SeatBookingModel[]>
   */
  async getSeatBookingsByScreeningId(
    screeningId: string,
    transaction?: Transaction
  ): Promise<SeatBookingModel[]> {
    return await SeatBookingModel.findAll({
      where: { screeningId },
      transaction,
    });
  }

  /**
   * Delete a seat booking by screeningId and seatId.
   * @param screeningId - Screening ID
   * @param seatId - Seat ID
   * @param transaction - Optional transaction for atomic operations
   * @returns Promise<boolean> - True if deleted, false otherwise
   */
  async deleteSeatBooking(
    screeningId: string,
    seatId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    const deleted = await SeatBookingModel.destroy({
      where: { screeningId, seatId },
      transaction,
    });
    return deleted > 0;
  }

  /**
   * Delete all seat bookings for a specific booking ID.
   * @param bookingId - The booking ID
   * @param transaction - Optional transaction for atomic operations
   * @returns Number of records deleted
   */
  async deleteSeatBookingsByBookingId(
    bookingId: string,
    transaction?: Transaction
  ): Promise<number> {
    return await SeatBookingModel.destroy({
      where: { bookingId },
      transaction,
    });
  }

  /**
   * Check if all seat IDs exist in the movie hall's layout.
   * Throws BadRequestError if an invalid seat ID is found.
   *
   * @param {string} screeningId - The screening ID.
   * @param {string[]} seatIds - Array of seat IDs to validate.
   * @param {Transaction} transaction - Optional transaction for consistent reads.
   * @throws {NotFoundError} If screening or movie hall not found.
   * @throws {BadRequestError} If a seat ID does not exist in the layout.
   */
  async checkSeatsExist(
    screeningId: string,
    seatIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    // If no seats to check, nothing to do
    if (!seatIds.length) {
      return;
    }

    // Use the screeningService instead of this
    const screening = await screeningService.getScreeningById(
      screeningId,
      transaction
    );

    if (!screening) {
      throw new NotFoundError(`Screening not found with ID ${screeningId}`);
    }

    // Get the movie hall, with proper transaction handling
    try {
      // Check if the MovieHallService accepts a transaction parameter
      // If it doesn't, we need to call it without the transaction
      const movieHall = await movieHallService.getMovieHall(
        screening.theaterId,
        screening.hallId
      );

      const seatsLayout = movieHall.seatsLayout;
      const validSeats = new Set<string>();

      // Build a set of valid seat IDs from the layout
      for (let row = 0; row < seatsLayout.length; row++) {
        for (let col = 0; col < seatsLayout[row].length; col++) {
          const seatValue = seatsLayout[row][col];
          if (seatValue && seatValue !== 0) {
            validSeats.add(seatValue.toString());
          }
        }
      }

      // Check if all seatIds exist in the validSeats set
      for (const seatId of seatIds) {
        if (!validSeats.has(seatId)) {
          throw new BadRequestError(`Invalid seat ID: ${seatId}`);
        }
      }
    } catch (error) {
      // If the error is already a custom error (NotFoundError, BadRequestError), rethrow it
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }

      // Otherwise, wrap it in a more specific error
      throw new Error(`Error validating seats: ${(error as Error).message}`);
    }
  }

  /**
   * Check if given seat IDs are available (not already booked for the screening).
   * Throws ConflictError if any seat is already booked.
   *
   * @param {string} screeningId - The screening ID.
   * @param {string[]} seatIds - Array of seat IDs to check availability.
   * @param {Transaction} transaction - Optional transaction for consistent reads.
   * @throws {ConflictError} If a seat is already booked.
   */
  async checkSeatsAvailable(
    screeningId: string,
    seatIds: string[],
    transaction?: Transaction
  ): Promise<void> {
    // If no seats to check, nothing to do
    if (!seatIds.length) {
      return;
    }

    try {
      // First, query all existing bookings for the given seats in this screening
      const existingBookings = await SeatBookingModel.findAll({
        where: {
          screeningId,
          seatId: seatIds,
          // Optionally filter by status if you don't want to count canceled bookings
          // status: ['pending', 'confirmed']
        },
        transaction,
      });

      // If there are any bookings, collect the booked seat IDs
      if (existingBookings.length > 0) {
        const bookedSeatIds = existingBookings.map((booking) => booking.seatId);
        throw new ConflictError(
          `The following seats are already booked: ${bookedSeatIds.join(', ')}`
        );
      }
    } catch (error) {
      // If the error is already a custom error (ConflictError), rethrow it
      if (error instanceof ConflictError) {
        throw error;
      }

      // Otherwise, wrap it in a more specific error
      throw new Error(
        `Error checking seat availability: ${(error as Error).message}`
      );
    }
  }
}
