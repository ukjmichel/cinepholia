import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  Default,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface MovieAttributes {
  movieId: string;
  name: string;
  description: string;
  age: string;
  genre: string;
  date: Date;
}

// On creation, movieId is optional because it's auto-generated
interface MovieCreationAttributes
  extends Optional<MovieAttributes, 'movieId'> {}

@Table({ tableName: 'movies', timestamps: true })
export class MovieModel
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4) // auto-generate UUIDs
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
  public name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public age!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public genre!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  public date!: Date;
}

export { MovieAttributes, MovieCreationAttributes };
