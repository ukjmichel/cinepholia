import mongoose from 'mongoose';
import { CommentModel } from '../models/comment.model';
import { BookingModel } from '../models/booking.model';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';
import { ConflictError } from '../errors/ConflictError';
import { ScreeningModel } from '../models/screening.model';

export class CommentService {
  async createComment({
    bookingId,
    comment,
    rating,
  }: {
    bookingId: string;
    comment: string;
    rating: number;
  }) {
    // 1. Check booking exists (MySQL)
    const booking = await BookingModel.findOne({ where: { bookingId } });
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // 2. Ensure no existing comment (MongoDB)
    const existing = await CommentModel.findOne({ bookingId });
    if (existing) {
      throw new ConflictError('A comment already exists for this booking');
    }

    // 3. Create the comment (MongoDB)
    try {
      const newComment = await CommentModel.create({
        bookingId,
        comment,
        rating,
      });
      return newComment;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError('A comment already exists for this booking');
      }
      throw err;
    }
  }

  async getCommentByBooking(bookingId: string) {
    const comment = await CommentModel.findOne({ bookingId });
    if (!comment) {
      throw new NotFoundError('Comment not found for this booking');
    }
    return comment;
  }

  static async listComments(status?: 'pending' | 'confirmed') {
    const query = status ? { status } : {};
    return await CommentModel.find(query);
  }

  async confirmComment(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid comment ID');
    }

    const updated = await CommentModel.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundError('Comment not found');
    }

    return updated;
  }

  async deleteComment(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid comment ID');
    }

    const deleted = await CommentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError('Comment not found');
    }

    return deleted;
  }

  async getCommentsByMovieId(
    movieId: string,
    status?: 'pending' | 'confirmed' | 'all'
  ) {
    // 1. Get all screenings for the movie
    const screenings = await ScreeningModel.findAll({
      where: { movieId },
      attributes: ['screeningId'],
    });

    if (screenings.length === 0) {
      throw new NotFoundError('No screenings found for this movie');
    }

    const screeningIds = screenings.map((s) => s.screeningId);

    // 2. Get all bookings for those screenings
    const bookings = await BookingModel.findAll({
      where: { screeningId: screeningIds },
      attributes: ['bookingId'],
    });

    if (bookings.length === 0) {
      throw new NotFoundError('No bookings found for this movie');
    }

    const bookingIds = bookings.map((b) => b.bookingId);

    // 3. Build MongoDB query
    const query: any = { bookingId: { $in: bookingIds } };
    if (status && status !== 'all') {
      query.status = status;
    }

    // 4. Query comments in MongoDB
    const comments = await CommentModel.find(query);
    return comments;
  }
}
