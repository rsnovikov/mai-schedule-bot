import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';

export interface LessonTimeCreationAttrs {
  order: number;
  start: string;
  end: string;
}

@Table({
  tableName: 'lessonTime',
  timestamps: false,
})
export class LessonTimeModel extends Model<LessonTimeModel, LessonTimeCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  order: number;

  @Column({ type: DataType.STRING })
  start: string;

  @Column({ type: DataType.STRING })
  end: string;

  @HasMany(() => LessonModel)
  lessons: LessonModel[];
}
