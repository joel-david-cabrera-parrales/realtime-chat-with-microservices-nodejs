import { NextFunction, Request, Response } from "express";
import { TokenService } from "../domain/token.generator.service";
import { sendError } from "../http/api-response";

export interface TokenPayload {
  credentialId: number;
  username: string;
}

export function createValidateTokenMiddleware(tokenService: TokenService) {
  return function validateTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
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
      res.locals.username = payload.username;
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
