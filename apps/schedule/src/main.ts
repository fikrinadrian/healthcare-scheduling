import { NestFactory } from '@nestjs/core';
import { ScheduleModule } from './schedule.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ScheduleModule);
  await app.listen(3002);
}
await bootstrap();
