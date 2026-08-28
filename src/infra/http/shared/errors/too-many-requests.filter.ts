import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import { Response } from "express";
import { sendHttpError } from "./http-error-response";

@Catch(ThrottlerException)
export class TooManyRequestsFilter implements ExceptionFilter {
  catch(_exception: ThrottlerException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    sendHttpError(
      response,
      HttpStatus.TOO_MANY_REQUESTS,
      "Too Many Requests",
      "Too many requests",
    );
  }
}
