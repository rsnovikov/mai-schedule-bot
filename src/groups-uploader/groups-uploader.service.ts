import { Injectable } from '@nestjs/common';
import { MaiHttpService } from '../mai-http/mai-http.service';
import { JSDOM } from 'jsdom';
import { degrees, degreesRegexps } from '../constants/degrees';
import { InjectModel } from '@nestjs/sequelize';
import { GroupModel } from '../models/group.model';
import { faculties } from '../constants/faculties';
import { courses } from '../constants/courses';

@Injectable()
export class GroupsUploaderService {
  private url: string = 'https://mai.ru/education/studies/schedule/groups.php';

  constructor(
    private readonly maiHttpService: MaiHttpService,
    @InjectModel(GroupModel) private groupModel: typeof GroupModel,
  ) {
    // this.updateGroupsData();
  }

  getGroupsFromHtml(html: string) {
    const dom = new JSDOM(html);
    const groupLinks = dom.window.document.querySelector('.tab-content')?.querySelectorAll('a');
    return [...(groupLinks || [])].map((groupLink) => {
      // todo: handle errors
      const groupName = groupLink.textContent?.trim() || '';
      const groupDegree =
        degreesRegexps.find((degree) => new RegExp(degree.regexp, 'g').test(groupName))?.value ||
        degrees.bachelor;
      return {
        name: groupName,
        degree: groupDegree,
      };
    });
  }

  async updateGroupsData() {
    // await this.groupModel.truncate({
    //   cascade: true,
    // });
    // await fs.writeFile(
    //   path.resolve(process.cwd(), 'src', 'groups-uploader', '3-3-groups.html'),
    //   html,
    // );
    for (const faculty of faculties) {
      const department = `Институт №${faculty}`;
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        setTimeout(async () => {
          const html = await this.maiHttpService.getHtmlFromServer({
            url: this.url,
            params: {
              department: String(department),
              course: String(course),
            },
          });
          const groups = this.getGroupsFromHtml(html);
          for (const groupData of groups) {
            this.groupModel.create({
              ...groupData,
              course,
              faculty,
            });
          }
        }, 1280 * i);
      }
    }
    // const html = (
    //   await fs.readFile(path.resolve(process.cwd(), 'src', 'groups-uploader', '3-3-groups.html'))
    // ).toString();
  }
}
