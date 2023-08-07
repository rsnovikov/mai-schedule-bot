import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonModel } from '../models/lesson.model';
import { Op, WhereOptions } from 'sequelize';
import { LessonTimeModel } from '../models/lessonTime.model';
import { LessonTypeModel } from '../models/lessonType.model';
import * as moment from 'moment';
import { addZero } from '../utils/utils';
import { TeacherModel } from '../models/teacher.model';
import { PlaceModel } from '../models/place.model';
import { GroupModel } from '../models/group.model';

interface FindAllWithIncludeProps {
  where: WhereOptions<LessonModel>;
}

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(LessonModel) private lessonModel: typeof LessonModel,
    @InjectModel(LessonTimeModel) private lessonTimeModel: typeof LessonTimeModel,
    @InjectModel(LessonTypeModel) private lessonTypeModel: typeof LessonTypeModel,
    @InjectModel(TeacherModel) private teacherModel: typeof TeacherModel,
    @InjectModel(PlaceModel) private placeModel: typeof PlaceModel,
  ) {}

  async getAll(group: GroupModel) {
    const lessons = await this.findAllWithInclude({
      where: {
        groupId: group.id,
      },
    });

    return lessons;
  }

  async getByWeek(group: GroupModel, weekParam: number) {
    const weekBase = moment('2022-09-01').week();
    const week = weekBase + weekParam - 2;
    const weekStartDate = moment(`2022-W${addZero(week)}`);
    const weekEndDate = moment(`2022-W${addZero(week)}-7`);

    const lessons = await this.findAllWithInclude({
      where: {
        date: {
          [Op.gte]: weekStartDate.toDate(),
          [Op.lte]: weekEndDate.toDate(),
          // [Op.eq]
        },
        groupId: group.id,
      },
    });
    return lessons;
  }

  async getByDate(groupId: number, dateStr: string) {
    const date = new Date(dateStr);
    const lessons = await this.findAllWithInclude({
      where: {
        date: {
          [Op.eq]: date,
        },
        groupId,
      },
    });
    return lessons;
  }

  private async findAllWithInclude({ where }: FindAllWithIncludeProps) {
    return await this.lessonModel.findAll({
      include: [
        { model: this.lessonTimeModel, attributes: ['id', 'order', 'end', 'start'] },
        { model: this.teacherModel, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: this.placeModel, attributes: ['id', 'name'], through: { attributes: [] } },
        { model: this.lessonTypeModel, attributes: ['id', 'name'] },
      ],
      where,
      attributes: ['id', 'name', 'date'],
      order: [
        ['date', 'ASC'],
        ['time', 'order', 'ASC'],
      ],
    });
  }
}
