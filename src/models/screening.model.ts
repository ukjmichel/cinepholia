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

// Related models
import { MovieModel } from './movie.model';
import { MovieTheaterModel } from './movietheater.model';
import { MovieHallModel } from './movieHall.model';

/**
 * Interface for Screening entity attributes.
 */
export interface ScreeningAttributes {
  screeningId: string;
  movieId: string;
  theaterId: string;
  hallId: string;
  startTime: Date;
  durationTime: string; // Stored as TIME, but remains Date object in JS
}

/**
 * Interface for creation attributes (screeningId is optional during creation).
 */
export interface ScreeningCreationAttributes
  extends Optional<ScreeningAttributes, 'screeningId'> {}

/**
 * Sequelize model representing a screening (a scheduled movie showing).
 */
@Table({ tableName: 'screenings', timestamps: true })
export class ScreeningModel
  extends Model<ScreeningAttributes, ScreeningCreationAttributes>
  implements ScreeningAttributes
{
  /**
   * Unique identifier for the screening.
   */
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  public screeningId!: string;

  /**
   * Foreign key to the movie being screened.
   */
  @ForeignKey(() => MovieModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  public movieId!: string;

  /**
   * Foreign key to the theater where the screening is happening.
   */
  @ForeignKey(() => MovieTheaterModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public theaterId!: string;

  /**
   * Foreign key to the hall within the theater.
   */
  @ForeignKey(() => MovieHallModel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public hallId!: string;

  /**
   * Start time of the screening (date and time).
   */
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public startTime!: Date;

  /**
   * Duration of the movie (stored as TIME in database).
   */
  @Column({
    type: DataType.TIME,
    allowNull: false,
    validate: {
      isCorrectFormat(value: string) {
        const regex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!regex.test(value)) {
          throw new Error(
            'DurationTime must be a valid string in format HH:mm:ss'
          );
        }
      },
    },
  })
  public durationTime!: string;

  /**
   * Relation to the movie entity.
   */
  @BelongsTo(() => MovieModel)
  public movie!: MovieModel;

  /**
   * Relation to the movie theater entity.
   */
  @BelongsTo(() => MovieTheaterModel)
  public theater!: MovieTheaterModel;

  /**
   * Relation to the movie hall entity.
   */
  @BelongsTo(() => MovieHallModel)
  public hall!: MovieHallModel;
}
