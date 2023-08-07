import { Controller, Get, Param, Query } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { ValidateGroupPipe } from '../pipes/validateGroup.pipe';
import { GroupModel } from '../models/group.model';
import { ValidateWeekPipe } from '../pipes/validate-week.pipe';

@Controller('/lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('/')
  async getAll(@Query('group', ValidateGroupPipe) group: GroupModel) {
    return await this.lessonService.getAll(group);
  }

  @Get('/week/:week')
  async getByWeek(
    @Query('group', ValidateGroupPipe) group: GroupModel,
    @Param('week', ValidateWeekPipe) week: number,
  ) {
    return await this.lessonService.getByWeek(group, week);
  }

  @Get('/date/:dateStr')
  async getByDate(
    @Query('group', ValidateGroupPipe) group: GroupModel,
    @Param('dateStr') dateStr: string,
  ) {
    return await this.lessonService.getByDate(group.id, dateStr);
  }
}
