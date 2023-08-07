import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GroupModel } from './group.model';

interface userCreationAttrs {
  groupId: number;
  tgId: number;
}

@Table({ tableName: 'tgUser', timestamps: false })
export class UserModel extends Model<UserModel, userCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    unique: true,
  })
  tgId: number;

  @ForeignKey(() => GroupModel)
  @Column({ type: DataType.INTEGER })
  groupId: number;
}
