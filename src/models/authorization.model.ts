import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserModel } from './user.model';

type Role = 'utilisateur' | 'employé' | 'administrateur';

interface AuthorizationAttributes {
  userId: string;
  role: Role;
}

@Table({ tableName: 'authorization', timestamps: true })
class AuthorizationModel
  extends Model<AuthorizationAttributes>
  implements AuthorizationAttributes
{
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  public userId!: string;

  @Column({
    type: DataType.ENUM('utilisateur', 'employé', 'administrateur'),
    allowNull: false,
    defaultValue: 'utilisateur',
  })
  public role!: Role;

  @BelongsTo(() => UserModel)
  user!: UserModel;
}

export { AuthorizationModel, Role };
