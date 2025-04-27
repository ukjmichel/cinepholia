// src/models/seatbooking.model.ts
import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  IsUUID,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ScreeningModel } from './screening.model';
import { BookingModel } from './booking.model';

export interface SeatBookingAttributes {
  screeningId: string;
  seatId: string;
  bookingId: string;
}

@Table({
  tableName: 'seat_bookings',
  timestamps: false, // Optional: true if you want createdAt/updatedAt
})
export class SeatBookingModel extends Model<SeatBookingAttributes> {
  @PrimaryKey
  @IsUUID(4)
  @ForeignKey(() => ScreeningModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'screening_id',
  })
  screeningId!: string;

  @PrimaryKey
  @Column(DataType.STRING) // change from DataType.INTEGER
  seatId!: string;


  @IsUUID(4)
  @ForeignKey(() => BookingModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'booking_id',
  })
  bookingId!: string;

  // Associations
  @BelongsTo(() => ScreeningModel)
  screening!: ScreeningModel;

  @BelongsTo(() => BookingModel)
  booking!: BookingModel;
}
