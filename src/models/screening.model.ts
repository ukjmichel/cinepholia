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
import { MovieModel } from './movie.model';
import { MovieTheaterModel } from './movietheater.model';
import { MovieHallModel } from './movieHall.model'; // Fixed casing to be consistent

// Interfaces
interface ScreeningAttributes {
  screeningId: string;
  movieId: string;
  theaterId: string;
  hallId: string;
  startTime: Date;
  durationTime: Date; // Still Date type in JS, but only time part is significant
}

interface ScreeningCreationAttributes
  extends Optional<ScreeningAttributes, 'screeningId'> {}

@Table({ tableName: 'screenings', timestamps: true })
export class ScreeningModel
  extends Model<ScreeningAttributes, ScreeningCreationAttributes>
  implements ScreeningAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  public screeningId!: string;

  @ForeignKey(() => MovieModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public movieId!: string;

  @ForeignKey(() => MovieTheaterModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public theaterId!: string;

  @ForeignKey(() => MovieHallModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public hallId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public startTime!: Date;

  @Column({
    type: DataType.TIME, // Changed from DATE to TIME to store only time information
    allowNull: false,
  })
  public durationTime!: Date;

  // Relations
  @BelongsTo(() => MovieModel)
  public movie!: MovieModel;

  @BelongsTo(() => MovieTheaterModel)
  public theater!: MovieTheaterModel;

  @BelongsTo(() => MovieHallModel)
  public hall!: MovieHallModel;
}

export { ScreeningAttributes, ScreeningCreationAttributes };
