import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { LessonModel } from '../models/lesson.model';
import { LessonTimeModel } from '../models/lessonTime.model';
import { LessonTypeModel } from '../models/lessonType.model';
import { TeacherModel } from '../models/teacher.model';
import { PlaceModel } from '../models/place.model';
import { GroupModel } from '../models/group.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LessonModel,
      LessonTimeModel,
      LessonTypeModel,
      TeacherModel,
      PlaceModel,
      GroupModel,
    ]),
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
