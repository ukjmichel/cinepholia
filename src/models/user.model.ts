import {
  Column,
  Model,
  Table,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { Optional } from 'sequelize';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

@Table({ tableName: 'users', timestamps: true })
class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    unique: true,
  })
  public id!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    validate: {
      len: {
        args: [2, 20],
        msg: 'Name must be between 2 and 20 characters',
      },
      is: {
        args: /^[a-zA-Z0-9]+$/,
        msg: 'Name can only contain letters and numbers',
      },
    },
  })
  public name!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  public email!: string;

  @Column(DataType.STRING)
  public password!: string;

  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: UserModel) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }
}

export { UserModel };
