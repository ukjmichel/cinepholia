import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from './user.model';
import { ScreeningModel } from './screening.model';

/**
 * Attributes required for a booking record.
 */
export interface BookingAttributes {
  bookingId: string;
  userId: string;
  screeningId: string;
  seatsNumber: number;
  status: 'pending' | 'used' | 'canceled';
}

/**
 * Attributes required for creating a booking.
 * `bookingId` and `status` are optional during creation.
 */
export interface BookingCreationAttributes
  extends Optional<BookingAttributes, 'bookingId' | 'status'> {}

/**
 * Represents a booking made by a user for a specific screening.
 */
@Table({ tableName: 'bookings', timestamps: true })
export class BookingModel
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  /**
   * Unique identifier for the booking.
   */
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  public bookingId!: string;

  /**
   * ID of the user who made the booking.
   */
  @Index
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public userId!: string;

  /**
   * ID of the screening that was booked.
   */
  @Index
  @ForeignKey(() => ScreeningModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public screeningId!: string;

  /**
   * Number of seats reserved by the user.
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public seatsNumber!: number;

  /**
   * Current status of the booking.
   * Can be 'pending', 'used', or 'canceled'.
   */
  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'used', 'canceled'),
    allowNull: false,
  })
  public status!: 'pending' | 'used' | 'canceled';

  /**
   * The user associated with this booking.
   */
  @BelongsTo(() => UserModel)
  public user!: UserModel;

  /**
   * The screening associated with this booking.
   */
  @BelongsTo(() => ScreeningModel)
  public screening!: ScreeningModel;
}
