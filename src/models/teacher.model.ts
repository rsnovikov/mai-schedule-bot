import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';
import { LessonTeacherModel } from './lessonTeacher.model';

interface TeacherCreationAttrs {
  name: string;
}

@Table({
  tableName: 'teacher',
  timestamps: false,
})
export class TeacherModel extends Model<TeacherModel, TeacherCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @BelongsToMany(() => LessonModel, { through: { model: () => LessonTeacherModel } })
  lessons: LessonModel[];
}
