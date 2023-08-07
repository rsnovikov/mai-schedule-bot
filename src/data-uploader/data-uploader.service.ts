import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonModel } from '../models/lesson.model';
import { JSDOM } from 'jsdom';
import { formatDate } from '../utils/formatDate';
import { GroupModel } from '../models/group.model';
import { LessonTimeModel } from '../models/lessonTime.model';
import { LessonTypeModel } from '../models/lessonType.model';
import { TeacherModel } from '../models/teacher.model';
import { PlaceModel } from '../models/place.model';
import { Timeout } from '@nestjs/schedule';
import { MaiHttpService } from '../mai-http/mai-http.service';
import { LessonTeacherModel } from '../models/lessonTeacher.model';
import { LessonPlaceModel } from '../models/lessonPlace.model';

const findTimeId = (time: string, timesData: LessonTimeModel[]): number | undefined => {
  const timeItems = time.split('–');
  const startTime = timeItems[0].trim();
  const endTime = timeItems[1].trim();
  return timesData.find(({ start, end }) => {
    return start === startTime && end === endTime;
  })?.id;
};

const findTypeId = (type: string, typesData: LessonTypeModel[]): number | undefined => {
  return typesData.find(({ name }) => {
    return name === type;
  })?.id;
};

interface ILesson {
  name: string;
  type: string;
  time: string;
  teachers: string[];
  places: string[];
}

interface IDay {
  date: Date;
  lessons: ILesson[];
}

const START_WEEK = 1;
const END_WEEK = 18;

@Injectable()
export class DataUploaderService {
  private url: string = 'https://mai.ru/education/studies/schedule/index.php';

  constructor(
    @InjectModel(LessonModel)
    private lessonModel: typeof LessonModel,
    @InjectModel(GroupModel)
    private groupModel: typeof GroupModel,
    @InjectModel(LessonTimeModel)
    private lessonTimeModel: typeof LessonTimeModel,
    @InjectModel(LessonTypeModel)
    private lessonTypeModel: typeof LessonTypeModel,
    @InjectModel(TeacherModel)
    private teacherModel: typeof TeacherModel,
    @InjectModel(PlaceModel)
    private placeModel: typeof PlaceModel,
    private readonly maiHttpService: MaiHttpService,
    @InjectModel(LessonTeacherModel)
    private lessonTeacherModel: typeof LessonTeacherModel,
    @InjectModel(LessonPlaceModel)
    private lessonPlaceModel: typeof LessonPlaceModel,
  ) {}

  getDataFromHtml(html: string) {
    const dom = new JSDOM(html);
    const steps = dom.window.document.querySelectorAll('.step-content');

    const days: IDay[] = [];

    steps.forEach((step) => {
      const date = step.querySelector('.step-title')?.textContent?.trim() || '';
      const formattedDate = new Date(formatDate(date));

      const dayLessonsElements: Element[] = [];
      step.childNodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === 'div') {
          dayLessonsElements.push(node as Element);
        }
      });
      const dayLessons: ILesson[] = [];
      dayLessonsElements.forEach((lessonElement) => {
        const lessonNameBlock = lessonElement.querySelector('p');
        let lessonName = lessonNameBlock?.childNodes[0]?.textContent?.trim();
        if (lessonNameBlock?.childNodes[1].childNodes.length !== 1) {
          lessonName += ' ' + lessonNameBlock?.childNodes[1]?.childNodes[0]?.textContent?.trim();
        }
        const lessonType = lessonElement?.querySelector('.badge')?.textContent?.trim();
        const aboutList = lessonElement.querySelector('ul');

        const lessonTime = aboutList?.children[0]?.textContent?.trim();

        let lessonTeachers: string[] = [];
        let lessonPlaces: string[] = [];

        [...(aboutList?.children || [])].slice(1).forEach((item) => {
          if (item.querySelector('i.fa-map-marker-alt')) {
            lessonPlaces.push(item?.textContent?.trim() || '');
          } else {
            lessonTeachers.push(item?.textContent?.trim() || '');
          }
        });

        const lesson: ILesson = {
          name: lessonName || '',
          type: lessonType || '',
          time: lessonTime || '',
          teachers: lessonTeachers,
          places: lessonPlaces,
        };
        dayLessons.push(lesson);
      });

      const day: IDay = {
        date: formattedDate,
        lessons: dayLessons,
      };
      days.push(day);
    });
    return days;
  }

  async updateWeekSchedule(group: GroupModel, week: number) {
    const html = await this.maiHttpService.getHtmlFromServer({
      url: this.url,
      params: {
        group: group.name,
        week: String(week),
      },
    });
    const days = this.getDataFromHtml(html);

    const timesData = await this.lessonTimeModel.findAll();
    const typesData = await this.lessonTypeModel.findAll();
    for (const dayData of days) {
      for (const lesson of dayData.lessons) {
        // Todo: handle a potential errors
        const timeId = findTimeId(lesson.time, timesData) || 1;
        const typeId = findTypeId(lesson.type, typesData) || 1;
        const { id: lessonId } = await this.lessonModel.create({
          name: lesson.name,
          date: dayData.date,
          timeId,
          typeId,
          groupId: group.id,
        });
        for (const teacher of lesson.teachers) {
          const [{ id: teacherId }] = await this.teacherModel.findOrCreate({
            where: {
              name: teacher,
            },
            defaults: {
              name: teacher,
            },
          });

          await this.lessonTeacherModel.create({
            lessonId,
            teacherId,
          });
        }

        for (const place of lesson.places) {
          const [{ id: placeId }] = await this.placeModel.findOrCreate({
            where: {
              name: place,
            },
            defaults: {
              name: place,
            },
          });

          await this.lessonPlaceModel.create({
            lessonId,
            placeId,
          });
        }
      }
    }
  }

  async initialiseModelData<M, I>(model: M, items: I[]) {
    // @ts-ignore
    if ((await model.count()) === items.length) return;
    for (const item of items) {
      // @ts-ignore
      await model.create(item);
    }
  }

  async updateScheduleDataByGroup(group: GroupModel) {
    for (let i = START_WEEK; i <= END_WEEK; i++) {
      await this.updateWeekSchedule(group, i);
    }
  }

  async updateScheduleData() {
    await this.lessonPlaceModel.truncate({ cascade: true });
    const groups = await this.groupModel.findAll({
      where: {
        name: 'М3О-332Б-20',
      },
    });
    for (let i = 0; i < groups.length; i++) {
      await this.updateScheduleDataByGroup(groups[i]);
    }
  }

  @Timeout(0)
  async intervalUpdate() {
    // await this.updateScheduleData();
  }
}
