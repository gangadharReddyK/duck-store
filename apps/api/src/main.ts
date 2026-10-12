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
    .setDescription('API for managing ducks, store operations, and health checks. You can use this interface to document, share, and test your APIs directly from your browser.')
    .setVersion('1.0')
    .addTag('ducks', 'Duck warehouse operations')
    .addTag('store', 'Store and order operations')
    .addTag('health', 'Health check endpoints')
    .addServer('/api')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Duck Store API - Swagger UI',
  });
  await app.listen(config.port);
}
await bootstrap();