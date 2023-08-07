import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';

export interface LessonTypeCreationAttrs {
  name: string;
}

@Table({
  tableName: 'lessonType',
  timestamps: false,
})
export class LessonTypeModel extends Model<LessonTypeModel, LessonTypeCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @HasMany(() => LessonModel)
  lessons: LessonModel[];
}
