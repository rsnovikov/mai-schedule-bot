import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { LessonTypeModel } from './lessonType.model';
import { LessonTimeModel } from './lessonTime.model';
import { GroupModel } from './group.model';
import { TeacherModel } from './teacher.model';
import { LessonTeacherModel } from './lessonTeacher.model';
import { LessonPlaceModel } from './lessonPlace.model';
import { PlaceModel } from './place.model';

export interface LessonCreationAttrs {
  name: string;
  date: Date;
  groupId: number;
  typeId: number;
  timeId: number;
}

@Table({ tableName: 'lesson', deletedAt: false, version: false })
export class LessonModel extends Model<LessonModel, LessonCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.DATE })
  date: Date;

  @ForeignKey(() => LessonTypeModel)
  @Column({ type: DataType.INTEGER })
  typeId: number;

  @BelongsTo(() => LessonTypeModel)
  type: LessonTypeModel;

  @ForeignKey(() => LessonTimeModel)
  @Column({ type: DataType.INTEGER })
  timeId: number;

  @BelongsTo(() => LessonTimeModel)
  time: LessonTimeModel;

  @ForeignKey(() => GroupModel)
  @Column({ type: DataType.INTEGER })
  groupId: number;

  @BelongsToMany(() => TeacherModel, { through: { model: () => LessonTeacherModel } })
  teachers: TeacherModel[];

  @BelongsToMany(() => PlaceModel, () => LessonPlaceModel)
  places: PlaceModel[];
}
