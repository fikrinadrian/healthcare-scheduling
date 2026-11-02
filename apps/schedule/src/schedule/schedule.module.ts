import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';
import { ScheduleResolver } from './schedule.resolver.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailNotificationService } from '../notifications/email-notification.service.js';

@Module({
  providers: [
    ScheduleResolver,
    ScheduleService,
    PrismaService,
    EmailNotificationService,
  ],
})
export class ScheduleModule {}
