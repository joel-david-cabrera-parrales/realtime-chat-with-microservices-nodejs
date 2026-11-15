import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export interface RequestLogEntry {
  level: "info" | "warn" | "error";
  service: string;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip: string | null;
  userAgent: string | null;
  timestamp: string;
}

/**
 * Middleware de observabilidad: asigna (o propaga) un `x-request-id`, lo devuelve en la
 * respuesta y escribe una linea JSON por peticion (nivel segun el status code).
 */
export function createRequestLoggerMiddleware(serviceName: string) {
  return function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = String(req.headers["x-request-id"] ?? randomUUID());
    const startedAt = process.hrtime.bigint();

    res.locals.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      const entry: RequestLogEntry = {
        level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
        service: serviceName,
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round((Number(process.hrtime.bigint() - startedAt) / 1_000_000) * 100) / 100,
        ip: req.ip ?? null,
        userAgent: req.headers["user-agent"] ?? null,
        timestamp: new Date().toISOString(),
      };

      const line = JSON.stringify(entry);

      if (entry.level === "error") {
        console.error(line);
        return;
      }

      if (entry.level === "warn") {
        console.warn(line);
        return;
      }

      console.log(line);
    });

    next();
  };
}
