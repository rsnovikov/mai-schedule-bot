import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidateWeekPipe implements PipeTransform {
  transform(week: string, metadata: ArgumentMetadata) {
    const weekParam = Number(week);
    if (!weekParam || weekParam < 1 || weekParam > 18) {
      throw new HttpException('Неделя не введена или передано некорректное значение', 400);
    }
    return weekParam;
  }
}
