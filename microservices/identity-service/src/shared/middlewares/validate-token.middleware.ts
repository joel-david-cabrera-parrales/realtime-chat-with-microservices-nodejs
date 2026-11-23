import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { TokenService } from "../domain/services/token.generator.service";
import { sendError } from "../http/api-response";

export interface TokenPayload {
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  username: string;
}

export function createValidateTokenMiddleware(tokenService: TokenService, internalApiKey?: string) {
  return function validateTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
    const providedInternalKey = req.headers["x-internal-api-key"];
    if (internalApiKey !== undefined && typeof providedInternalKey === "string") {
      const provided = Buffer.from(providedInternalKey);
      const expected = Buffer.from(internalApiKey);
      if (provided.length === expected.length && timingSafeEqual(provided, expected)) {
        res.locals.isInternalRequest = true;
        next();
        return;
      }
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      sendError(res, {
        statusCode: 401,
        message: "Token no proporcionado",
        error: "Unauthorized",
      });
      return;
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      sendError(res, {
        statusCode: 401,
        message: "Token no proporcionado",
        error: "Unauthorized",
      });
      return;
    }

    try {
      const payload = tokenService.verifyAccessToken(token) as unknown as TokenPayload;
      res.locals.token = token;
      res.locals.credentialId = payload.credentialId;
      res.locals.credentialCode = payload.credentialCode;
      res.locals.profileCode = payload.profileCode;
      res.locals.username = payload.username;
      res.locals.isInternalRequest = false;
      next();
    } catch {
      sendError(res, {
        statusCode: 401,
        message: "Token inválido o expirado",
        error: "Unauthorized",
      });
    }
  };
}
