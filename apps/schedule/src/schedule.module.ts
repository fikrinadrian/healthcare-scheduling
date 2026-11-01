import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller.js';
import { ScheduleService } from './schedule.service.js';

@Module({
  imports: [],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
