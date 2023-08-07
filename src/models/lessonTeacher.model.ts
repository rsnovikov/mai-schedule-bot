import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';
import { TeacherModel } from './teacher.model';

interface LessonTeacherCreationAttrs {
  lessonId: number;
  teacherId: number;
}

@Table({
  tableName: 'lessonTeacher',
  timestamps: false,
})
export class LessonTeacherModel extends Model<LessonTeacherModel, LessonTeacherCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => LessonModel)
  @Column({ type: DataType.INTEGER })
  lessonId: number;

  @ForeignKey(() => TeacherModel)
  @Column({ type: DataType.INTEGER })
  teacherId: number;
}
