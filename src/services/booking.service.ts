import { BookingModel, BookingAttributes } from '../models/booking.model';

export class BookingService {
  /**
   * Create a new booking.
   * @param data - The booking attributes
   * @returns The created booking
   */
  async createBooking(data: BookingAttributes): Promise<BookingModel> {
    return BookingModel.create(data);
  }

  /**
   * Get a booking by ID.
   * @param bookingId - The ID of the booking
   * @returns The found booking or null
   */
  async getBookingById(bookingId: string): Promise<BookingModel | null> {
    return BookingModel.findByPk(bookingId);
  }

  /**
   * Get all bookings.
   * @returns List of bookings
   */
  async getAllBookings(): Promise<BookingModel[]> {
    return BookingModel.findAll();
  }

  /**
   * Update a booking by ID.
   * @param bookingId - The ID of the booking
   * @param updateData - Partial attributes to update
   * @returns The updated booking or null if not found
   */
  async updateBooking(
    bookingId: string,
    updateData: Partial<BookingAttributes>
  ): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId);
    if (!booking) return null;
    await booking.update(updateData);
    return booking;
  }

  /**
   * Delete a booking by ID.
   * @param bookingId - The ID of the booking
   * @returns True if deleted, false otherwise
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    const deleted = await BookingModel.destroy({
      where: { bookingId },
    });
    return deleted > 0;
  }

  /**
   * Get all bookings for a specific user.
   * @param userId - The ID of the user
   * @returns List of bookings for the user
   */
  async getBookingsByUserId(userId: string): Promise<BookingModel[]> {
    return BookingModel.findAll({
      where: { userId },
    });
  }

  /**
   * Mark a booking as used.
   * @param bookingId - The ID of the booking
   * @returns The updated booking or null if not found
   */
  async markBookingAsUsed(bookingId: string): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId);
    if (!booking) return null;
    booking.status = 'used';
    await booking.save();
    return booking;
  }

  /**
   * Cancel a booking.
   * @param bookingId - The ID of the booking
   * @returns The updated booking or null if not found
   */
  async cancelBooking(bookingId: string): Promise<BookingModel | null> {
    const booking = await BookingModel.findByPk(bookingId);
    if (!booking) return null;
    booking.status = 'canceled';
    await booking.save();
    return booking;
  }
}
