// src/__tests__/booking/booking.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import {
  handleCreateBooking,
  handleGetBookingById,
  handleGetAllBookings,
  handleUpdateBooking,
  handleDeleteBooking,
  handleGetBookingsByUser,
  handleMarkBookingAsUsed,
  handleCancelBooking,
  bookingService,
  screeningService,
  seatBookingService,
  movieHallService,
} from '../../controllers/booking.controller';
import { BookingService } from '../../services/booking.service';
import { ScreeningService } from '../../services/screening.service';
import { SeatBookingService } from '../../services/seatBooking.service';
import { MovieHallService } from '../../services/movieHall.service';
import { NotFoundError } from '../../errors/NotFoundError';
import { BadRequestError } from '../../errors/BadRequestError';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../../config/db';
import { CommentModel } from '../../models/comment.model';
import crypto from 'crypto';

// Mock all required services
jest.mock('../../services/booking.service');
jest.mock('../../services/screening.service');
jest.mock('../../services/seatBooking.service');
jest.mock('../../services/movieHall.service');
jest.mock('../../models/comment.model');
jest.mock('../../config/db', () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

describe('Booking Controller Unit Tests', () => {
  let mockReq: Partial<Request & { user?: any }>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockTransaction: any;

  beforeEach(() => {
    // Setup mock request, response, and next function
    mockReq = {
      params: {},
      body: {},
      user: { id: 'user-123' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    mockNext = jest.fn();

    // Create mock transaction
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    // Setup transaction mock
    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);

    // Reset all mocks
    jest.clearAllMocks();

    // Spy on console.error to avoid polluting test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleCreateBooking', () => {
    it('should create a booking with seat reservations successfully', async () => {
      // Arrange
      const screeningId = 'screening-123';
      const seatIds = ['A1', 'A2'];
      const bookingId = '123e4567-e89b-12d3-a456-426614174000'; // Properly formatted UUID

      mockReq.body = {
        screeningId,
        seatsNumber: 2,
        seatIds,
      };

      // Mock UUID generation with a properly formatted UUID
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(bookingId);

      // Mock service calls
      (seatBookingService.checkSeatsExist as jest.Mock).mockResolvedValue(
        undefined
      );
      (seatBookingService.checkSeatsAvailable as jest.Mock).mockResolvedValue(
        undefined
      );

      const mockBooking = {
        bookingId,
        userId: mockReq.user.id,
        screeningId,
        seatsNumber: 2,
        status: 'pending',
      };

      (bookingService.createBooking as jest.Mock).mockResolvedValue(
        mockBooking
      );

      const mockSeatBookings = [
        { screeningId, seatId: 'A1', bookingId },
        { screeningId, seatId: 'A2', bookingId },
      ];

      (seatBookingService.createSeatBooking as jest.Mock).mockImplementation(
        (data) => Promise.resolve({ ...data })
      );

      // Act
      await handleCreateBooking(mockReq as any, mockRes as Response, mockNext);

      // Assert
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(seatBookingService.checkSeatsExist).toHaveBeenCalledWith(
        screeningId,
        seatIds,
        mockTransaction
      );
      expect(seatBookingService.checkSeatsAvailable).toHaveBeenCalledWith(
        screeningId,
        seatIds,
        mockTransaction
      );
      expect(bookingService.createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId,
          userId: mockReq.user.id,
          screeningId,
          seatsNumber: 2,
          status: 'pending',
        }),
        mockTransaction
      );
      expect(seatBookingService.createSeatBooking).toHaveBeenCalledTimes(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Booking created successfully',
        booking: mockBooking,
        seats: expect.any(Array),
        totalSeats: 2,
      });
    });

    it('should handle unauthenticated user', async () => {
      // Arrange
      mockReq.user = undefined;

      mockReq.body = {
        screeningId: 'screening-123',
        seatsNumber: 2,
        seatIds: ['A1', 'A2'],
      };

      // Act
      await handleCreateBooking(mockReq as any, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotAuthorizedError));
      // The controller appears to start a transaction before validation
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle no seats selected', async () => {
      // Arrange
      mockReq.body = {
        screeningId: 'screening-123',
        seatsNumber: 0,
        seatIds: [],
      };

      // Act
      await handleCreateBooking(mockReq as any, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      // The controller appears to start a transaction before validation
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle seats number mismatch', async () => {
      // Arrange
      mockReq.body = {
        screeningId: 'screening-123',
        seatsNumber: 3,
        seatIds: ['A1', 'A2'],
      };

      // Act
      await handleCreateBooking(mockReq as any, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      // The controller appears to start a transaction before validation
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle error and rollback transaction', async () => {
      // Arrange
      const screeningId = 'screening-123';
      const seatIds = ['A1', 'A2'];

      mockReq.body = {
        screeningId,
        seatsNumber: 2,
        seatIds,
      };

      // Mock UUID generation with a properly formatted UUID
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

      // Make a service method throw an error
      const error = new Error('Service error');
      (seatBookingService.checkSeatsExist as jest.Mock).mockRejectedValue(
        error
      );

      // Act
      await handleCreateBooking(mockReq as any, mockRes as Response, mockNext);

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetBookingById', () => {
    it('should return a booking when found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const mockBooking = {
        bookingId,
        userId: 'user-123',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'pending',
      };

      (bookingService.getBookingById as jest.Mock).mockResolvedValue(
        mockBooking
      );

      // Act
      await handleGetBookingById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(bookingService.getBookingById).toHaveBeenCalledWith(bookingId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBooking);
    });

    it('should handle booking not found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174001';
      mockReq.params = { bookingId };

      (bookingService.getBookingById as jest.Mock).mockResolvedValue(null);

      // Act
      await handleGetBookingById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle service error', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const error = new Error('Service error');
      (bookingService.getBookingById as jest.Mock).mockRejectedValue(error);

      // Act
      await handleGetBookingById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetAllBookings', () => {
    it('should return all bookings', async () => {
      // Arrange
      const mockBookings = [
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'user-123',
          screeningId: 'screening-123',
          seatsNumber: 2,
          status: 'pending',
        },
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174001',
          userId: 'user-456',
          screeningId: 'screening-456',
          seatsNumber: 1,
          status: 'confirmed',
        },
      ];

      (bookingService.getAllBookings as jest.Mock).mockResolvedValue(
        mockBookings
      );

      // Act
      await handleGetAllBookings(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(bookingService.getAllBookings).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBookings);
    });

    it('should handle service error', async () => {
      // Arrange
      const error = new Error('Service error');
      (bookingService.getAllBookings as jest.Mock).mockRejectedValue(error);

      // Act
      await handleGetAllBookings(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleUpdateBooking', () => {
    it('should update a booking successfully', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const updateData = {
        status: 'confirmed',
      };
      mockReq.body = updateData;

      const updatedBooking = {
        bookingId,
        userId: 'user-123',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'confirmed',
      };

      (bookingService.updateBooking as jest.Mock).mockResolvedValue(
        updatedBooking
      );

      // Act
      await handleUpdateBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(bookingService.updateBooking).toHaveBeenCalledWith(
        bookingId,
        updateData,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedBooking);
    });

    it('should handle booking not found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174001';
      mockReq.params = { bookingId };
      mockReq.body = { status: 'confirmed' };

      (bookingService.updateBooking as jest.Mock).mockResolvedValue(null);

      // Act
      await handleUpdateBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle error and rollback transaction', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };
      mockReq.body = { status: 'confirmed' };

      const error = new Error('Service error');
      (bookingService.updateBooking as jest.Mock).mockRejectedValue(error);

      // Act
      await handleUpdateBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleDeleteBooking', () => {
    it('should delete a booking with associated seat bookings', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      (
        seatBookingService.deleteSeatBookingsByBookingId as jest.Mock
      ).mockResolvedValue(2); // 2 seat bookings deleted
      (bookingService.deleteBooking as jest.Mock).mockResolvedValue(true);

      // Act
      await handleDeleteBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(
        seatBookingService.deleteSeatBookingsByBookingId
      ).toHaveBeenCalledWith(bookingId, mockTransaction);
      expect(bookingService.deleteBooking).toHaveBeenCalledWith(
        bookingId,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle booking not found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174001';
      mockReq.params = { bookingId };

      (
        seatBookingService.deleteSeatBookingsByBookingId as jest.Mock
      ).mockResolvedValue(0);
      (bookingService.deleteBooking as jest.Mock).mockResolvedValue(false);

      // Act
      await handleDeleteBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle error and rollback transaction', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const error = new Error('Service error');
      (
        seatBookingService.deleteSeatBookingsByBookingId as jest.Mock
      ).mockRejectedValue(error);

      // Act
      await handleDeleteBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetBookingsByUser', () => {
    it('should return bookings with hasComment flag', async () => {
      // Arrange
      const userId = 'user-123';
      mockReq.params = { userId };

      const mockBookings = [
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174000',
          userId,
          screeningId: 'screening-123',
          seatsNumber: 2,
          status: 'pending',
          toJSON: jest.fn().mockReturnValue({
            bookingId: '123e4567-e89b-12d3-a456-426614174000',
            userId,
            screeningId: 'screening-123',
            seatsNumber: 2,
            status: 'pending',
          }),
        },
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174001',
          userId,
          screeningId: 'screening-456',
          seatsNumber: 1,
          status: 'confirmed',
          toJSON: jest.fn().mockReturnValue({
            bookingId: '123e4567-e89b-12d3-a456-426614174001',
            userId,
            screeningId: 'screening-456',
            seatsNumber: 1,
            status: 'confirmed',
          }),
        },
      ];

      (bookingService.getBookingsByUserId as jest.Mock).mockResolvedValue(
        mockBookings
      );

      // Mock CommentModel.find
      const mockComments = [
        { bookingId: '123e4567-e89b-12d3-a456-426614174000' },
      ];
      (CommentModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockComments),
      });

      // Act
      await handleGetBookingsByUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(bookingService.getBookingsByUserId).toHaveBeenCalledWith(userId);
      expect(CommentModel.find).toHaveBeenCalledWith({
        bookingId: {
          $in: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
          ],
        },
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // Check the response JSON
      const responseJson = mockRes.json as jest.Mock;
      expect(responseJson).toHaveBeenCalledWith([
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174000',
          userId,
          screeningId: 'screening-123',
          seatsNumber: 2,
          status: 'pending',
          hasComment: true, // This booking has a comment
        },
        {
          bookingId: '123e4567-e89b-12d3-a456-426614174001',
          userId,
          screeningId: 'screening-456',
          seatsNumber: 1,
          status: 'confirmed',
          hasComment: false, // This booking has no comment
        },
      ]);
    });

    it('should handle empty bookings', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      mockReq.params = { userId };

      (bookingService.getBookingsByUserId as jest.Mock).mockResolvedValue([]);

      // Mock CommentModel.find
      (CommentModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      // Act
      await handleGetBookingsByUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(bookingService.getBookingsByUserId).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle service error', async () => {
      // Arrange
      const userId = 'user-123';
      mockReq.params = { userId };

      const error = new Error('Service error');
      (bookingService.getBookingsByUserId as jest.Mock).mockRejectedValue(
        error
      );

      // Act
      await handleGetBookingsByUser(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleMarkBookingAsUsed', () => {
    it('should mark a booking as used', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const updatedBooking = {
        bookingId,
        userId: 'user-123',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'used',
      };

      (bookingService.markBookingAsUsed as jest.Mock).mockResolvedValue(
        updatedBooking
      );

      // Act
      await handleMarkBookingAsUsed(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(bookingService.markBookingAsUsed).toHaveBeenCalledWith(
        bookingId,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedBooking);
    });

    it('should handle booking not found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174001';
      mockReq.params = { bookingId };

      (bookingService.markBookingAsUsed as jest.Mock).mockResolvedValue(null);

      // Act
      await handleMarkBookingAsUsed(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle error and rollback transaction', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const error = new Error('Service error');
      (bookingService.markBookingAsUsed as jest.Mock).mockRejectedValue(error);

      // Act
      await handleMarkBookingAsUsed(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('handleCancelBooking', () => {
    it('should cancel a booking', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const updatedBooking = {
        bookingId,
        userId: 'user-123',
        screeningId: 'screening-123',
        seatsNumber: 2,
        status: 'canceled',
      };

      (bookingService.cancelBooking as jest.Mock).mockResolvedValue(
        updatedBooking
      );

      // Act
      await handleCancelBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(bookingService.cancelBooking).toHaveBeenCalledWith(
        bookingId,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedBooking);
    });

    it('should handle booking not found', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174001';
      mockReq.params = { bookingId };

      (bookingService.cancelBooking as jest.Mock).mockResolvedValue(null);

      // Act
      await handleCancelBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should handle error and rollback transaction', async () => {
      // Arrange
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      mockReq.params = { bookingId };

      const error = new Error('Service error');
      (bookingService.cancelBooking as jest.Mock).mockRejectedValue(error);

      // Act
      await handleCancelBooking(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
