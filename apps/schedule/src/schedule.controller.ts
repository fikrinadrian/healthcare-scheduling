import { Controller, Get } from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';

@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  getHello(): string {
    return this.scheduleService.getHello();
  }
}
