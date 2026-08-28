import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { sendHttpError } from "./http-error-response";

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    sendHttpError(
      response,
      HttpStatus.UNPROCESSABLE_ENTITY,
      "Unprocessable Entity",
      exception.error,
    );
  }
}
