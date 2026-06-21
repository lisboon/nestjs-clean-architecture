import { BadLoginError } from '@/modules/@shared/domain/errors/bad-login.error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadLoginError)
export class BadLoginErrorFilter implements ExceptionFilter {
  catch(exception: BadLoginError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(exception.status).json({
      statusCode: exception.status,
      error: 'Bad Login',
      message: exception.message,
    });
  }
}
