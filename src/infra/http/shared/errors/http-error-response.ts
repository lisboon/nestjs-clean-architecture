import { Response } from "express";

export function sendHttpError(
  response: Response,
  statusCode: number,
  error: string,
  message: string | object,
): void {
  response.status(statusCode).json({ statusCode, error, message });
}
