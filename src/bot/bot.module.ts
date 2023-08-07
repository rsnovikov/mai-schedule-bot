import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { ConfigModule } from '@nestjs/config';
import { LessonModule } from '../lesson/lesson.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupModel } from '../models/group.model';
import { UserModel } from '../models/user.model';

const sessions = new LocalSession({ database: 'sessions_db.json' });
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forFeature([GroupModel, UserModel]),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware('session')],
      token: process.env.TELEGRAM_API_TOKEN || '',
    }),
    LessonModule,
  ],
  controllers: [],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
