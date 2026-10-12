import { NestFactory } from '@nestjs/core';
import { config } from './database/config.js';
import { AppModule } from './app.module.js';
import { configureApp } from './common/app-setup.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: undefined,
  });
  configureApp(app);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Duck Store API')
    .setDescription('API for managing ducks, store operations, and health checks.')
    .setVersion('1.0')
    .addTag('ducks')
    .addTag('store')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(config.port);
}
await bootstrap();