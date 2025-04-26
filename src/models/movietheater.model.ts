import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

interface MovieTheaterAttributes {
  theaterId: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
}

@Table({ tableName: 'movie_theater', timestamps: true })
class MovieTheaterModel
  extends Model<MovieTheaterAttributes>
  implements MovieTheaterAttributes
{
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  public theaterId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public address!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public postalCode!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public city!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public phone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  public email!: string;

  // Optional: timestamps (createdAt and updatedAt)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export { MovieTheaterModel, MovieTheaterAttributes };
