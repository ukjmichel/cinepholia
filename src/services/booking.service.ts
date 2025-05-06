import { BookingModel, BookingAttributes } from '../models/booking.model';
import { Transaction } from 'sequelize';

export class BookingService {
  /**
   * Create a new booking.
   * @param data - The booking attributes
   * @param transaction - Optional transaction for atomic operations
   * @returns The created booking
   */
  async createBooking(
    data: BookingAttributes,
    transaction?: Transaction
  ): Promise<BookingModel> {
    return BookingModel.create(data, { transaction });
  }

  /**
   * Get a booking by ID.
   * @param bookingId - The ID of the booking
   * @param transaction - Optional transaction for consistent reads
   * @returns The found booking or null
   */
  async getBookingById(
    bookingId: string,
    transaction?: Transaction
  ): Promise<BookingModel | null> {
    return BookingModel.findByPk(bookingId, { transaction });
  }

  /**
   * Get all bookings.
   * @param transaction - Optional transaction for consistent reads
   * @returns List of bookings
   */
  async getAllBookings(transaction?: Transaction): Promise<BookingModel[]> {
    return BookingModel.findAll({ transaction });
  }

  /**
   * Update a booking by ID.
   * @param bookingId - The ID of the booking
   * @param updateData - Partial attributes to update
   * @param transaction - Optional transaction for atomic operations
   * @returns The updated booking or null if not found
   */
  async updateBooking(
    bookingId: string,
    updateData: Partial<BookingAttributes>,
    transaction?: Transaction
  ): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId, { transaction });
    if (!booking) return null;
    await booking.update(updateData, { transaction });
    return booking;
  }

  /**
   * Delete a booking by ID.
   * @param bookingId - The ID of the booking
   * @param transaction - Optional transaction for atomic operations
   * @returns True if deleted, false otherwise
   */
  async deleteBooking(
    bookingId: string,
    transaction?: Transaction
  ): Promise<boolean> {
    const deleted = await BookingModel.destroy({
      where: { bookingId },
      transaction,
    });
    return deleted > 0;
  }

  /**
   * Get all bookings for a specific user.
   * @param userId - The ID of the user
   * @param transaction - Optional transaction for consistent reads
   * @returns List of bookings for the user
   */
  async getBookingsByUserId(
    userId: string,
    transaction?: Transaction
  ): Promise<BookingModel[]> {
    return BookingModel.findAll({
      where: { userId },
      transaction,
    });
  }

  /**
   * Mark a booking as used.
   * @param bookingId - The ID of the booking
   * @param transaction - Optional transaction for atomic operations
   * @returns The updated booking or null if not found
   */
  async markBookingAsUsed(
    bookingId: string,
    transaction?: Transaction
  ): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId, { transaction });
    if (!booking) return null;
    booking.status = 'used';
    await booking.save({ transaction });
    return booking;
  }

  /**
   * Cancel a booking.
   * @param bookingId - The ID of the booking
   * @param transaction - Optional transaction for atomic operations
   * @returns The updated booking or null if not found
   */
  async cancelBooking(
    bookingId: string,
    transaction?: Transaction
  ): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId, { transaction });
    if (!booking) return null;
    booking.status = 'canceled';
    await booking.save({ transaction });
    return booking;
  }

  /**
   * Get bookings by status.
   * @param status - The booking status to filter by
   * @param transaction - Optional transaction for consistent reads
   * @returns List of bookings with the specified status
   */
  async getBookingsByStatus(
    status: string,
    transaction?: Transaction
  ): Promise<BookingModel[]> {
    return BookingModel.findAll({
      where: { status },
      transaction,
    });
  }
}
