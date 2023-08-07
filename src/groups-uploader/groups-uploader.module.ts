import { Module } from '@nestjs/common';
import { GroupsUploaderService } from './groups-uploader.service';
import { MaiHttpModule } from '../mai-http/mai-http.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { GroupModel } from '../models/group.model';

@Module({
  imports: [MaiHttpModule, SequelizeModule.forFeature([GroupModel])],
  providers: [GroupsUploaderService],
})
export class GroupsUploaderModule {}
