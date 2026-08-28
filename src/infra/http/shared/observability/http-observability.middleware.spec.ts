import { EventEmitter } from "node:events";
import { LoggerService } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { createHttpObservabilityMiddleware } from "./http-observability.middleware";

describe("HttpObservabilityMiddleware", () => {
  const logger: jest.Mocked<LoggerService> = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserves a valid request id and logs a successful response", () => {
    const { request, response, finish } = createHttpExchange({
      requestId: "client-request-123",
      statusCode: 200,
    });
    const next = jest.fn() as NextFunction;

    createHttpObservabilityMiddleware(logger)(request, response, next);
    finish();

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      "client-request-123",
    );
    expect(logger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "client-request-123",
        method: "GET",
        path: "/users",
        statusCode: 200,
        durationMs: expect.any(Number),
      }),
    );
  });

  it("replaces an unsafe request id and logs client errors as warnings", () => {
    const { request, response, finish } = createHttpExchange({
      requestId: "invalid\nlog-entry",
      statusCode: 422,
    });

    createHttpObservabilityMiddleware(logger)(request, response, jest.fn());
    finish();

    const generatedId = (response.setHeader as jest.Mock).mock.calls[0][1];
    expect(generatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: generatedId, statusCode: 422 }),
    );
  });

  it("logs server errors at error level", () => {
    const { request, response, finish } = createHttpExchange({
      statusCode: 503,
    });

    createHttpObservabilityMiddleware(logger)(request, response, jest.fn());
    finish();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 503 }),
    );
  });
});

function createHttpExchange({
  requestId,
  statusCode,
}: {
  requestId?: string;
  statusCode: number;
}) {
  const emitter = new EventEmitter();
  const request = {
    get: jest.fn().mockReturnValue(requestId),
    method: "GET",
    path: "/users",
  } as unknown as Request;
  const response = {
    statusCode,
    setHeader: jest.fn(),
    once: emitter.once.bind(emitter),
  } as unknown as Response;

  return {
    request,
    response,
    finish: () => emitter.emit("finish"),
  };
}
