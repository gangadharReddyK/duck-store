import { INestApplication, ValidationPipe, ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export const GLOBAL_PREFIX = 'api';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    console.error('### HTTP ERROR ###', error.message, error.stack);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = error.getStatus?.() ?? 500;
    let code: string;
    let message: string;
    let details: any;

    if (status === 400 && error.response?.details) {
      code = 'VALIDATION_ERROR';
      message = error.response.message ?? 'Validation failed';
      details = error.response.details;
    } else if (status === 404) {
      code = 'NOT_FOUND';
      message = error.message ?? 'Not found';
      details = undefined;
    } else {
      code = 'INTERNAL_ERROR';
      message = 'Internal server error';
      details = undefined;
    }

    response.status(status).json({ code, message, details });
  }
}

export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix(GLOBAL_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const details = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
          value: err.value,
        }));
        return new HttpException(
          {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
          400,
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
}