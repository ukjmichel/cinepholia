import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

// Import related models
import { UserModel } from './user.model';
import { ScreeningModel } from './screening.model';

// Interfaces
interface BookingAttributes {
  bookingId: string;
  userId: string;
  screeningId: string;
  bookingDate: Date;
  seatsNumber: number;
  status: 'pending' | 'used' | 'canceled'; // <-- Restricting to specific values
}

interface BookingCreationAttributes
  extends Optional<BookingAttributes, 'bookingId' | 'status'> {}

@Table({ tableName: 'bookings', timestamps: true })
export class BookingModel
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  public bookingId!: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public userId!: string;

  @ForeignKey(() => ScreeningModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public screeningId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public bookingDate!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public seatsNumber!: number;

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'used', 'canceled'), // <-- using ENUM for strict validation in database
    allowNull: false,
  })
  public status!: 'pending' | 'used' | 'canceled';

  // Relations
  @BelongsTo(() => UserModel)
  public user!: UserModel;

  @BelongsTo(() => ScreeningModel)
  public screening!: ScreeningModel;
}

export { BookingAttributes, BookingCreationAttributes };
