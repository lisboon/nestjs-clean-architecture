import { NotFoundError } from "@/modules/@shared/domain/errors/not-found.error";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { sendHttpError } from "./http-error-response";

@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    sendHttpError(
      response,
      HttpStatus.NOT_FOUND,
      "Not Found",
      exception.message,
    );
  }
}
