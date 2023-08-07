import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { LessonModel } from './models/lesson.model';
import { LessonTypeModel } from './models/lessonType.model';
import { LessonTimeModel } from './models/lessonTime.model';
import { TeacherModel } from './models/teacher.model';
import { PlaceModel } from './models/place.model';
import { LessonModule } from './lesson/lesson.module';
import { DataUploaderModule } from './data-uploader/data-uploader.module';
import { GroupModel } from './models/group.model';
import { UserModel } from './models/user.model';
import { GroupsUploaderModule } from './groups-uploader/groups-uploader.module';
import { BotModule } from './bot/bot.module';
import { LessonTeacherModel } from './models/lessonTeacher.model';
import { LessonPlaceModel } from './models/lessonPlace.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadModels: true,
      synchronize: true,
      models: [
        LessonModel,
        LessonTypeModel,
        LessonTimeModel,
        TeacherModel,
        PlaceModel,
        GroupModel,
        UserModel,
        LessonTeacherModel,
        LessonPlaceModel,
      ],
      sync: {
        // force: true,
      },
    }),
    SequelizeModule.forFeature([LessonModel]),
    LessonModule,
    DataUploaderModule,
    BotModule,
    GroupsUploaderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
