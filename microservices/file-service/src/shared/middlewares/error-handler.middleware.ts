import { NextFunction, Request, Response } from "express";
import { HttpException } from "../http/http.exception";
import { sendError } from "../http/api-response";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpException) {
    sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
    return;
  }

  console.error(err);

  sendError(res, {
    statusCode: 500,
    message: "Error interno del servidor",
    error: "Internal Server Error",
  });
}
