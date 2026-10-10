import { NestFactory } from '@nestjs/core';
import { config } from './database/config.js';
import { AppModule } from './app.module.js';
import { configureApp } from './common/app-setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: undefined,
  });
  configureApp(app);
  await app.listen(config.port);
}
await bootstrap();