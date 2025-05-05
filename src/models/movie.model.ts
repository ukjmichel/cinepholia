import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

// Interface representing the Movie entity attributes
export interface MovieAttributes {
  movieId: string;
  title: string;
  description: string;
  ageRating: string;
  genre: string;
  releaseDate: Date;
  director: string;
  durationTime: string; // Updated: Duration stored as "HH:mm:ss"
  posterUrl?: string; // Optional field for movie poster URL
}

// Interface for creation attributes (movieId is optional because it's auto-generated)
export interface MovieCreationAttributes
  extends Optional<MovieAttributes, 'movieId'> {}

// Sequelize model definition for the 'movies' table
@Table({ tableName: 'movies', timestamps: true })
export class MovieModel
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  public movieId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  public description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public ageRating!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public genre!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public releaseDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public director!: string;

  @Column({
    type: DataType.TIME, // Optional: You can keep it as STRING, but TIME matches your intention
    allowNull: false,
    validate: {
      isCorrectFormat(value: string) {
        const regex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if (!regex.test(value)) {
          throw new Error(
            'durationTime must be a valid string in format HH:mm:ss'
          );
        }
      },
    },
  })
  public durationTime!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public posterUrl?: string;
}
