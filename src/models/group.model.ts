import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';
import { UserModel } from './user.model';

export interface GroupCreationAttrs {
  name: string;
  course: number;
  faculty: number;
  degree: string;
}

@Table({ tableName: 'group', timestamps: false })
export class GroupModel extends Model<GroupModel, GroupCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.INTEGER })
  faculty: number;

  @Column({ type: DataType.INTEGER })
  course: number;

  @Column({ type: DataType.STRING })
  degree: string;

  @HasMany(() => LessonModel)
  lessons: LessonModel[];

  @HasMany(() => UserModel)
  users: UserModel[];
}
