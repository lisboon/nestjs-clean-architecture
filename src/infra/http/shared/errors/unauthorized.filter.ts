import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";
import { sendHttpError } from "./http-error-response";

@Catch(UnauthorizedError, UnauthorizedException)
export class UnauthorizedErrorFilter implements ExceptionFilter {
  catch(
    exception: UnauthorizedError | UnauthorizedException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    sendHttpError(
      response,
      HttpStatus.UNAUTHORIZED,
      "Unauthorized",
      exception.message,
    );
  }
}
