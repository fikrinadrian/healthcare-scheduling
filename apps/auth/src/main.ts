import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.enableShutdownHooks();

  await app.listen(3001);
}
await bootstrap();
