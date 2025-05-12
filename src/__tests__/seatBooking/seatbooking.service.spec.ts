// src/__tests__/seatBooking/seatBooking.service.spec.ts
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { SeatBookingService } from '../../services/seatBooking.service';
import { SeatBookingModel } from '../../models/seatBooking.model';
import { BookingModel } from '../../models/booking.model';
import { ScreeningModel } from '../../models/screening.model';
import { MovieHallModel } from '../../models/movieHall.model';
import { BadRequestError } from '../../errors/BadRequestError';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';

import {
  setupInMemoryDatabase,
  connectInMemoryMongo,
  disconnectInMemoryMongo,
  seedBookingDependencies,
  resetTables,
} from '../../utils/setupTestDb';

describe('SeatBookingService', () => {
  let sequelize: Sequelize;
  let seatBookingService: SeatBookingService;
  let transaction: Transaction;

  beforeAll(async () => {
    // Setup in-memory databases
    sequelize = await setupInMemoryDatabase();

    // Add SeatBookingModel if not included in setupInMemoryDatabase
    sequelize.addModels([SeatBookingModel]);
    await sequelize.sync({ force: true });

    await connectInMemoryMongo();

    // Initialize the service
    seatBookingService = new SeatBookingService();
  });

  afterAll(async () => {
    await disconnectInMemoryMongo();
    await sequelize.close();
  });

  beforeEach(async () => {
    await resetTables();
    // Start a new transaction for each test
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    // Rollback transaction after each test
    await transaction.rollback();
  });

  describe('createSeatBooking', () => {
    it('should create a seat booking successfully', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      const seatBookingData = {
        screeningId: screening.screeningId,
        seatId: '1', // This should match a valid seat in the seatsLayout from seedBookingDependencies
        bookingId: booking.bookingId,
      };

      // Act
      const result = await seatBookingService.createSeatBooking(
        seatBookingData,
        transaction
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.screeningId).toBe(seatBookingData.screeningId);
      expect(result.seatId).toBe(seatBookingData.seatId);
      expect(result.bookingId).toBe(seatBookingData.bookingId);
    });
  });

  describe('getSeatBookingByScreeningIdAndSeatId', () => {
    it('should retrieve a seat booking by screeningId and seatId', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      const seatBookingData = {
        screeningId: screening.screeningId,
        seatId: '1',
        bookingId: booking.bookingId,
      };

      await SeatBookingModel.create(seatBookingData, { transaction });

      // Act
      const result =
        await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
          screening.screeningId,
          '1',
          transaction
        );

      // Assert
      expect(result).toBeDefined();
      expect(result!.screeningId).toBe(seatBookingData.screeningId);
      expect(result!.seatId).toBe(seatBookingData.seatId);
    });

    it('should return null when seat booking does not exist', async () => {
      // Arrange
      const { screening } = await seedBookingDependencies();

      // Act
      const result =
        await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
          screening.screeningId,
          'nonexistent-seat',
          transaction
        );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getSeatBookingsByBookingId', () => {
    it('should retrieve all seat bookings for a bookingId', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 2,
          status: 'pending',
        },
        { transaction }
      );

      // Create two seat bookings for the same booking
      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '1',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '2',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      // Act
      const results = await seatBookingService.getSeatBookingsByBookingId(
        booking.bookingId,
        transaction
      );

      // Assert
      expect(results).toHaveLength(2);
      expect(results.map((sb) => sb.seatId).sort()).toEqual(['1', '2']);
    });

    it('should return empty array when no seat bookings exist for bookingId', async () => {
      // Act
      const results = await seatBookingService.getSeatBookingsByBookingId(
        'nonexistent-booking',
        transaction
      );

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe('getSeatBookingsByScreeningId', () => {
    it('should retrieve all seat bookings for a screeningId', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking1 = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      const booking2 = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      // Create seat bookings for different bookings but same screening
      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '1',
          bookingId: booking1.bookingId,
        },
        { transaction }
      );

      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '2',
          bookingId: booking2.bookingId,
        },
        { transaction }
      );

      // Act
      const results = await seatBookingService.getSeatBookingsByScreeningId(
        screening.screeningId,
        transaction
      );

      // Assert
      expect(results).toHaveLength(2);
      expect(results.map((sb) => sb.seatId).sort()).toEqual(['1', '2']);
    });
  });

  describe('deleteSeatBooking', () => {
    it('should delete a seat booking successfully', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '1',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      // Act
      const result = await seatBookingService.deleteSeatBooking(
        screening.screeningId,
        '1',
        transaction
      );

      // Assert
      expect(result).toBe(true);

      // Verify the seat booking was deleted
      const deleted = await SeatBookingModel.findOne({
        where: { screeningId: screening.screeningId, seatId: '1' },
        transaction,
      });
      expect(deleted).toBeNull();
    });

    it('should return false when seat booking does not exist', async () => {
      // Arrange
      const { screening } = await seedBookingDependencies();

      // Act
      const result = await seatBookingService.deleteSeatBooking(
        screening.screeningId,
        'nonexistent-seat',
        transaction
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deleteSeatBookingsByBookingId', () => {
    it('should delete all seat bookings for a bookingId', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 2,
          status: 'pending',
        },
        { transaction }
      );

      // Create two seat bookings for the same booking
      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '1',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '2',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      // Act
      const deletedCount =
        await seatBookingService.deleteSeatBookingsByBookingId(
          booking.bookingId,
          transaction
        );

      // Assert
      expect(deletedCount).toBe(2);

      // Verify the seat bookings were deleted
      const remaining = await SeatBookingModel.findAll({
        where: { bookingId: booking.bookingId },
        transaction,
      });
      expect(remaining).toHaveLength(0);
    });
  });

  describe('checkSeatsExist', () => {
    it('should not throw error for valid seats', async () => {
      // Arrange
      const { screening } = await seedBookingDependencies();
      // Based on the seatsLayout defined in seedBaseScreeningDependencies: [[1, 2, 3, '', 4, 5], [6, 7, 8, '', 9, 10]]
      const validSeatIds = ['1', '2', '3'];

      // Act & Assert
      await expect(
        seatBookingService.checkSeatsExist(
          screening.screeningId,
          validSeatIds,
          transaction
        )
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestError for invalid seats', async () => {
      // Arrange
      const { screening } = await seedBookingDependencies();
      const invalidSeatIds = ['999', 'A1']; // Not in the seatsLayout

      // Act & Assert
      await expect(
        seatBookingService.checkSeatsExist(
          screening.screeningId,
          invalidSeatIds,
          transaction
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError when screening does not exist', async () => {
      // Act & Assert
      await expect(
        seatBookingService.checkSeatsExist(
          'nonexistent-screening',
          ['1'],
          transaction
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('checkSeatsAvailable', () => {
    it('should not throw error for available seats', async () => {
      // Arrange
      const { screening } = await seedBookingDependencies();
      const seatIds = ['1', '2'];

      // Act & Assert
      await expect(
        seatBookingService.checkSeatsAvailable(
          screening.screeningId,
          seatIds,
          transaction
        )
      ).resolves.not.toThrow();
    });

    it('should throw ConflictError for already booked seats', async () => {
      // Arrange
      const { user, screening } = await seedBookingDependencies();

      const booking = await BookingModel.create(
        {
          bookingId: uuidv4(),
          userId: user.id,
          screeningId: screening.screeningId,
          seatsNumber: 1,
          status: 'pending',
        },
        { transaction }
      );

      // Book seat '1'
      await SeatBookingModel.create(
        {
          screeningId: screening.screeningId,
          seatId: '1',
          bookingId: booking.bookingId,
        },
        { transaction }
      );

      // Try to check availability for already booked seat
      const seatsToCheck = ['1', '2'];

      // Act & Assert
      await expect(
        seatBookingService.checkSeatsAvailable(
          screening.screeningId,
          seatsToCheck,
          transaction
        )
      ).rejects.toThrow(ConflictError);
    });
  });
});
