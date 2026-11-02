import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import dayjs from 'dayjs';
import 'dayjs/locale/id.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type ScheduleNotification = {
  id: string;
  objective: string;
  scheduledAt: Date;
  customer: { name: string; email: string };
  doctor: { name: string };
};

function formatLocalDateTime(date: Date): string {
  return dayjs(date)
    .tz('Asia/Jakarta')
    .locale('id')
    .format('HH:mm, DD MMM YYYY');
}

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    this.from =
      config.get<string>('MAIL_FROM') ??
      'Healthcare Scheduling <no-reply@localhost>';

    if (!host) {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST is not configured; schedule emails are disabled',
      );
      return;
    }

    const port = Number(config.get<string>('SMTP_PORT') ?? 587);
    const secure = config.get<string>('SMTP_SECURE') === 'true';
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASSWORD');
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async scheduleCreated(schedule: ScheduleNotification): Promise<void> {
    await this.send(schedule, 'created');
  }

  async scheduleDeleted(schedule: ScheduleNotification): Promise<void> {
    await this.send(schedule, 'deleted');
  }

  private async send(
    schedule: ScheduleNotification,
    action: 'created' | 'deleted',
  ): Promise<void> {
    if (!this.transporter) return;

    const verb = action === 'created' ? 'created' : 'cancelled';
    const date = formatLocalDateTime(new Date(schedule.scheduledAt));
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: schedule.customer.email,
        subject: `Your appointment has been ${verb}`,
        text: [
          `Hello ${schedule.customer.name},`,
          `Your appointment has been ${verb}.`,
          `Doctor: ${schedule.doctor.name}`,
          `Purpose: ${schedule.objective}`,
          `Scheduled at: ${date}`,
        ].join('\n'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not send schedule ${action} email: ${message}`);
    }
  }
}
