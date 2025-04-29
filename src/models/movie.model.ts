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
interface MovieAttributes {
  movieId: string;
  title: string;
  description: string;
  ageRating: string;
  genre: string;
  releaseDate: Date;
  director: string;
  durationMinutes: number;
  posterUrl?: string; // Optional field for movie poster URL
}

// Interface for creation attributes (movieId is optional because it's auto-generated)
interface MovieCreationAttributes
  extends Optional<MovieAttributes, 'movieId'> {}

// Sequelize model definition for the 'movies' table
@Table({ tableName: 'movies', timestamps: true })
export class MovieModel
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4) // Automatically generate a UUID when creating a movie
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
  public title!: string; // Title of the movie (example: "Inception")

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  public description!: string; // Full description or synopsis of the movie

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public ageRating!: string; // Age rating (example: "PG-13", "R", "G")

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public genre!: string; // Movie genre (example: "Action", "Comedy")

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public releaseDate!: Date; // Release date of the movie

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public director!: string; // Name of the movie director (example: "Christopher Nolan")

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public durationMinutes!: number; // Duration of the movie in minutes (example: 120)

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  public posterUrl?: string; // Optional: URL to the movie's poster image
}

export { MovieAttributes, MovieCreationAttributes };
