import { Request, Response } from "express";
import { STATUS_CODES } from "node:http";
import type { ApiSuccess, ApiError } from "./api-response.interface";

export interface SendSuccessOptions<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

export interface SendErrorOptions {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export function requestPath(req: Request): string {
  return req.originalUrl ?? req.path ?? "";
}

export function sendSuccess<T>(
  res: Response,
  options: SendSuccessOptions<T>,
): void {
  const { statusCode = 200, message = "OK", data } = options;
  const body: ApiSuccess<T> = {
    statusCode,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    path: requestPath(res.req),
  };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  options: SendErrorOptions,
): void {
  const { statusCode, message, error } = options;
  const body: ApiError = {
    statusCode,
    success: false,
    message,
    error: error ?? STATUS_CODES[statusCode] ?? "Error",
    timestamp: new Date().toISOString(),
    path: requestPath(res.req),
  };
  res.status(statusCode).json(body);
}
