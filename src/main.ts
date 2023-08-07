import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initialTimes } from './constants/initialTimes';
import { initialTypes } from './constants/initialTypes';

async function bootstrap() {
  async function initialiseData() {
    await this.initialiseModelData(this.lessonTimeModel, initialTimes);
    await this.initialiseModelData(this.lessonTypeModel, initialTypes);
  }

  const app = await NestFactory.create(AppModule /*{ cors: true }*/);

  app.setGlobalPrefix('/api');
  await app.listen(5050);
}
bootstrap();
