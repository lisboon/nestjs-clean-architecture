import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { sendHttpError } from "./http-error-response";

@Catch(ForbiddenError, ForbiddenException)
export class ForbiddenErrorFilter implements ExceptionFilter {
  catch(exception: ForbiddenError | ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    sendHttpError(
      response,
      HttpStatus.FORBIDDEN,
      "Forbidden",
      exception.message,
    );
  }
}
