import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from '@nestjs/common';
import { GroupModel } from '../models/group.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ValidateGroupPipe implements PipeTransform {
  constructor(
    @InjectModel(GroupModel)
    private groupModel: typeof GroupModel,
  ) {}
  async transform(group: any, metadata: ArgumentMetadata) {
    if (!group) {
      throw new HttpException('введите номер группы', 400);
    }
    const groupRe = /^[МТ]([1-9]|1[0-2]])[ОЗ]-\d\d\d[БСМА](ки|к)?-(1[5-9]|2[0-2])$/g;
    if (!groupRe.test(group)) {
      throw new HttpException('группа введена некорректно', 400);
    }
    const groupData = await this.groupModel.findOne({
      where: {
        name: group,
      },
    });
    if (!groupData) {
      throw new HttpException('Группа не найдена', 400);
    }
    return groupData;
  }
}
