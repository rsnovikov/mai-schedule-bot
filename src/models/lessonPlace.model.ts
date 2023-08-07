import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { LessonModel } from './lesson.model';
import { PlaceModel } from './place.model';

interface LessonPlaceCreationAttrs {
  lessonId: number;
  placeId: number;
}

@Table({
  tableName: 'lessonPlace',
  timestamps: false,
})
export class LessonPlaceModel extends Model<LessonPlaceModel, LessonPlaceCreationAttrs> {
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

  @ForeignKey(() => PlaceModel)
  @Column({ type: DataType.INTEGER })
  placeId: number;
}
