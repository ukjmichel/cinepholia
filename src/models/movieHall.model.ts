import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

interface MovieHallAttributes {
  theaterId: string;
  hallId: string;
  seatsLayout: (string | number)[][]; // 2D array of seats
}

@Table({ tableName: 'movie_halls', timestamps: true })
class MovieHallModel
  extends Model<MovieHallAttributes>
  implements MovieHallAttributes
{
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public theaterId!: string;

  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public hallId!: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  public seatsLayout!: (string | number)[][];
}

export { MovieHallModel, MovieHallAttributes };
