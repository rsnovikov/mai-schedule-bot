import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MaiHttpService } from './mai-http.service';

@Module({
  imports: [HttpModule],
  providers: [MaiHttpService],
  exports: [MaiHttpService],
})
export class MaiHttpModule {}
