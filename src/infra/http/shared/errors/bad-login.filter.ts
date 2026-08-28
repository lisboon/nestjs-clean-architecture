import { BadLoginError } from "@/modules/@shared/domain/errors/bad-login.error";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { sendHttpError } from "./http-error-response";

@Catch(BadLoginError)
export class BadLoginErrorFilter implements ExceptionFilter {
  catch(exception: BadLoginError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    sendHttpError(
      response,
      HttpStatus.BAD_REQUEST,
      "Bad Login",
      exception.message,
    );
  }
}
