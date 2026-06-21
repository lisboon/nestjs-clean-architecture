import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ForbiddenError } from '@/modules/@shared/domain/errors/forbidden.error';

@Catch(ForbiddenError, ForbiddenException)
export class ForbiddenErrorFilter implements ExceptionFilter {
  catch(exception: ForbiddenError | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      error: 'Forbidden',
      message: exception.message,
    });
  }
}
