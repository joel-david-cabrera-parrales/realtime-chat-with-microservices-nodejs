import { NextFunction, Request, Response } from "express";
import { HttpException } from "../http/http.exception";
import { sendError } from "../http/api-response";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestId = String(res.locals.requestId ?? "");

  if (err instanceof HttpException) {
    sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
    return;
  }

  console.error(
    JSON.stringify({
      level: "error",
      service: process.env.SERVICE_NAME ?? "unknown",
      requestId,
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }),
  );

  sendError(res, {
    statusCode: 500,
    message: "Error interno del servidor",
    error: "Internal Server Error",
  });
}
