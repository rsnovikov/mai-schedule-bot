import { BotService } from './bot.service';
import { Action, Ctx, Help, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { LessonService } from '../lesson/lesson.service';
import * as moment from 'moment';
import { InjectModel } from '@nestjs/sequelize';
import { GroupModel } from '../models/group.model';
import { inlineKeyboard } from './keyboards/inline.keyboard';
import { Context } from './context.interface';
import { faculties } from '../constants/faculties';
import { courses } from '../constants/courses';
import { UserModel } from '../models/user.model';
import { degrees } from '../constants/degrees';

const botCommands = [
  {
    command: 'start',
    description: 'Запустить/перезапустить бота',
  },
  {
    command: 'help',
    description: 'Инструкция',
  },
];

@Update()
export class BotUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly botService: BotService,
    private readonly lessonService: LessonService,
    @InjectModel(GroupModel) private readonly groupModel: typeof GroupModel,
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
  ) {}

  getLessonsButtons() {
    const currentWeek = moment().week();
    const weekBase = moment('2022-09-01').week();
    const studyWeek = currentWeek - weekBase;
    return inlineKeyboard({
      data: [
        { text: 'Сегодня', callbackData: 'today' },
        { text: 'Завтра', callbackData: 'tomorrow' },
        { text: 'Текущая неделя', callbackData: `week_${studyWeek}` },
        { text: 'Все недели', callbackData: 'allWeek' },
      ],
      row: 2,
    });
  }

  getWeekButtons(currentWeek: number) {
    return inlineKeyboard({
      data: [
        {
          text: 'предыдущая неделя',
          callbackData: `week_${currentWeek - 1}`,
        },
        {
          text: 'следующая неделя',
          callbackData: `week_${currentWeek + 1}`,
        },
      ],
      row: 2,
    });
  }

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await this.bot.telegram.setMyCommands(botCommands);
    await ctx.replyWithHTML('Выберите свой институт', {
      reply_markup: inlineKeyboard({
        textPrefix: '',
        callbackDataPrefix: 'faculty_',
        data: faculties,
      }),
    });
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.replyWithHTML('Не нажимай');
  }

  @Action(/^faculty_([1-9]|1[0-2])$/g)
  async selectFacultyAction(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.data;
    const matches = data?.match(/^faculty_(\d{1,2})$/);
    if (!matches) return 'Институт не найден';
    ctx.session.faculty = Number(matches[1]);
    await ctx.editMessageText('Выберите курс:', {
      reply_markup: inlineKeyboard({
        data: courses,
        textPrefix: '',
        callbackDataPrefix: 'course_',
      }),
    });
  }

  @Action(/^course_(\d)$/g)
  async selectCourseAction(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.data;
    const matches = data?.match(/^course_([1-6])$/);
    if (!matches) return 'Курс не найден';
    ctx.session.course = Number(matches[1]);
    // const degreesButtons = [
    //   {
    //     data,
    //   },
    // ];
    const degreesButtons = Object.keys(degrees).map((degreeKey) => ({
      text: degrees[degreeKey],
      callbackData: degreeKey,
    }));
    await ctx.editMessageText('Выберите уровень подготовки:', {
      reply_markup: inlineKeyboard({
        data: degreesButtons,
        textPrefix: '',
        callbackDataPrefix: 'degree_',
      }),
    });
  }

  @Action(/^degree_[a-z]+$/g)
  async selectDegreeAction(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.data;
    const matches = data?.match(/^degree_([a-z]+)$/) || [];
    const degree = degrees[matches[1]];
    if (!degree) return 'Произошла ошибка, попробуйте позже';
    const { faculty, course } = ctx.session;
    const groups = await this.groupModel.findAll({
      where: {
        faculty,
        course,
        degree,
      },
    });
    const groupsButtons = groups.map((group) => ({ text: group.name, callbackData: group.id }));
    await ctx.editMessageText('Выберите группу:', {
      reply_markup: inlineKeyboard({
        data: groupsButtons,
        textPrefix: '',
        callbackDataPrefix: 'group_',
        row: 2,
      }),
    });
  }

  @Action(/^group_\d+$/g)
  async selectGroupAction(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.data;
    const matches = data?.match(/^group_(\d+)$/);
    if (!matches) return 'Группа не найдена';
    const groupId = Number(matches[1]);
    const userTgId = ctx.callbackQuery?.from.id;
    if (!userTgId) return 'Произошла ошибка';
    const existingUser = await this.userModel.findOne({
      where: {
        tgId: userTgId,
      },
    });
    if (!existingUser) {
      await this.userModel.create({
        tgId: userTgId,
        groupId,
      });
    } else if (existingUser.groupId !== groupId) {
      await this.userModel.update(
        {
          groupId,
          tgId: userTgId,
        },
        {
          where: {
            id: existingUser.id,
          },
        },
      );
    }
    const date = moment().format('YYYY-MM-DD');
    const lessonsList = await this.getDayLessonsList(groupId, date);
    await ctx.editMessageText(`<b>Расписание на сегодня (${date})</b>: ${lessonsList}`, {
      parse_mode: 'HTML',
      reply_markup: this.getLessonsButtons(),
    });
  }

  @Action('today')
  async getTodayLessonsList(@Ctx() ctx: Context) {
    try {
      const userTgId = ctx.callbackQuery?.from.id;
      if (!userTgId) return 'Произошла ошибка';
      const groupId = (
        await this.userModel.findOne({
          where: {
            tgId: userTgId,
          },
        })
      )?.groupId;
      if (!groupId) return 'Группа не найдена';
      const date = moment().format('YYYY-MM-DD');
      const lessonsList = await this.getDayLessonsList(groupId, date);
      await ctx.editMessageText(`<b>Расписание сегодня (${date})</b>: ${lessonsList}`, {
        parse_mode: 'HTML',
        reply_markup: this.getLessonsButtons(),
      });
    } catch (e) {
      console.error(e);
    }
  }

  @Action('tomorrow')
  async getTomorrowLessonsList(@Ctx() ctx: Context) {
    try {
      const userTgId = ctx.callbackQuery?.from.id;
      if (!userTgId) return 'Произошла ошибка';
      const groupId = (
        await this.userModel.findOne({
          where: {
            tgId: userTgId,
          },
        })
      )?.groupId;
      if (!groupId) return 'Группа не найдена';
      const date = moment(moment().add(1, 'day')).format('YYYY-MM-DD');
      const lessonsList = await this.getDayLessonsList(groupId, date);
      await ctx.editMessageText(`<b>Расписание завтра (${date})</b>: ${lessonsList}`, {
        parse_mode: 'HTML',
        reply_markup: this.getLessonsButtons(),
      });
    } catch (e) {
      console.error(e);
    }
  }

  @Action(/week_(\d{1,2})/g)
  async getCurrentWeekDays(@Ctx() ctx: Context) {
    const data = ctx.callbackQuery?.data;
    const matches = data?.match(/week_(\d{1,2})/);
    if (!matches) return 'Группа не найдена';
    const week = Number(matches[1]);
    try {
      await ctx.editMessageText(`<b>Текущая неделя ${week}</b>: `, {
        parse_mode: 'HTML',
        reply_markup: this.getWeekButtons(week),
      });
    } catch (e) {}
  }

  protected async getDayLessonsList(groupId: number, formattedDate: string) {
    const lessons = await this.lessonService.getByDate(groupId, formattedDate);
    const group = await this.groupModel.findOne({ where: { id: groupId } });
    return (
      `\n<b>${group?.name}</b>` +
      lessons.reduce((acc, lesson) => {
        return (
          acc +
          `\n\n<b>${lesson.time.order}. ${lesson.name}</b>` +
          `\n${lesson.type.name} <i>|</i> ${lesson.time.start} — ${lesson.time.end}` +
          `\n${lesson.places.map((place) => place.name).join(' <i>|</i> ')}` +
          (lesson.teachers.length > 0
            ? `\n${lesson.teachers.map((teacher) => teacher.name).join('\n')}`
            : '')
        );
      }, '')
    );
  }

  async getWeekDaysList(week: number) {}
}
