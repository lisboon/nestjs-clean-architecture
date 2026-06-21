import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";

@Catch(UnauthorizedError, UnauthorizedException)
export class UnauthorizedErrorFilter implements ExceptionFilter {
  catch(
    exception: UnauthorizedError | UnauthorizedException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: "Unauthorized",
      message: exception.message,
    });
  }
}
