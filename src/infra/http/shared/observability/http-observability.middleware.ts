import { randomUUID } from "node:crypto";
import { Logger, LoggerService } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/;

interface HttpLog {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}

export function createHttpObservabilityMiddleware(
  logger: LoggerService = new Logger("HTTP"),
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const requestId = resolveRequestId(request.get(REQUEST_ID_HEADER));
    const startedAt = process.hrtime.bigint();

    response.setHeader(REQUEST_ID_HEADER, requestId);
    response.once("finish", () => {
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const log: HttpLog = {
        requestId,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      };

      if (response.statusCode >= 500) {
        logger.error(log);
      } else if (response.statusCode >= 400) {
        logger.warn(log);
      } else {
        logger.log(log);
      }
    });

    next();
  };
}

function resolveRequestId(candidate: string | undefined): string {
  const value = candidate?.trim();
  return value && REQUEST_ID_PATTERN.test(value) ? value : randomUUID();
}
