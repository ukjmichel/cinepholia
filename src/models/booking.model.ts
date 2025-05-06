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
export interface BookingAttributes {
  bookingId: string;
  userId: string;
  screeningId: string;
  seatsNumber: number;
  status: 'pending' | 'used' | 'canceled';
}

export interface BookingCreationAttributes
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
    type: DataType.INTEGER,
    allowNull: false,
  })
  public seatsNumber!: number;

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'used', 'canceled'),
    allowNull: false,
  })
  public status!: 'pending' | 'used' | 'canceled';

  // Relations
  @BelongsTo(() => UserModel)
  public user!: UserModel;

  @BelongsTo(() => ScreeningModel)
  public screening!: ScreeningModel;
}


