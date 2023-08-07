import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LessonModel } from '../models/lesson.model';
import { DataUploaderService } from './data-uploader.service';
import { TeacherModel } from '../models/teacher.model';
import { LessonTimeModel } from '../models/lessonTime.model';
import { LessonTypeModel } from '../models/lessonType.model';
import { PlaceModel } from '../models/place.model';
import { GroupModel } from '../models/group.model';
import { ScheduleModule } from '@nestjs/schedule';
import { MaiHttpModule } from '../mai-http/mai-http.module';
import { LessonTeacherModel } from '../models/lessonTeacher.model';
import { LessonPlaceModel } from '../models/lessonPlace.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LessonModel,
      TeacherModel,
      LessonTimeModel,
      LessonTypeModel,
      PlaceModel,
      GroupModel,
      LessonTeacherModel,
      LessonPlaceModel,
    ]),
    ScheduleModule.forRoot(),
    MaiHttpModule,
  ],
  providers: [DataUploaderService],
  exports: [],
})
export class DataUploaderModule {}
