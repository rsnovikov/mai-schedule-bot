import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { LessonPlaceModel } from './lessonPlace.model';
import { LessonModel } from './lesson.model';

interface PlaceCreationAttrs {
  name: string;
}

@Table({
  tableName: 'place',
  timestamps: false,
})
export class PlaceModel extends Model<PlaceModel, PlaceCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @BelongsToMany(() => LessonModel, () => LessonPlaceModel)
  lessons: LessonModel[];
}
