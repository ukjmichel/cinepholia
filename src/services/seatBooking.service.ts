// src/services/seatBooking.service.ts

import {
  SeatBookingModel,
  SeatBookingAttributes,
} from '../models/seatBooking.model';

export class SeatBookingService {
  /**
   * Create a new seat booking.
   * @param data - The seat booking attributes
   * @returns Promise<SeatBookingModel> - The created seat booking
   */
  async createSeatBooking(
    data: SeatBookingAttributes
  ): Promise<SeatBookingModel> {
    return await SeatBookingModel.create(data);
  }

  /**
   * Get a seat booking by screeningId and seatId.
   * @param screeningId - Screening ID
   * @param seatId - Seat ID
   * @returns Promise<SeatBookingModel | null>
   */
  async getSeatBookingByScreeningIdAndSeatId(
    screeningId: string,
    seatId: string
  ): Promise<SeatBookingModel | null> {
    return await SeatBookingModel.findOne({ where: { screeningId, seatId } });
  }

  /**
   * Get all seat bookings by bookingId.
   * @param bookingId - Booking ID
   * @returns Promise<SeatBookingModel[]>
   */
  async getSeatBookingsByBookingId(
    bookingId: string
  ): Promise<SeatBookingModel[]> {
    return await SeatBookingModel.findAll({ where: { bookingId } });
  }

  /**
   * Get all seat bookings by screeningId.
   * @param screeningId - Screening ID
   * @returns Promise<SeatBookingModel[]>
   */
  async getSeatBookingsByScreeningId(
    screeningId: string
  ): Promise<SeatBookingModel[]> {
    return await SeatBookingModel.findAll({ where: { screeningId } });
  }

  /**
   * Delete a seat booking by screeningId and seatId.
   * @param screeningId - Screening ID
   * @param seatId - Seat ID
   * @returns Promise<boolean> - True if deleted, false otherwise
   */
  async deleteSeatBooking(
    screeningId: string,
    seatId: string
  ): Promise<boolean> {
    const deleted = await SeatBookingModel.destroy({
      where: { screeningId, seatId },
    });
    return deleted > 0;
  }
}
