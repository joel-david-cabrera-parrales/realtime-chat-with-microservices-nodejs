import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../../shared/http/api-response";
import { SessionApplicationServiceContract } from "../../application/contracts/session.application.service.contract";
import { SignupApplicationServiceContract } from "../../application/contracts/signup.application.service.contract";
import { CredentialNotAuthenticatedException } from "../../domain/exceptions/credential-not-authenticated.exception";
import { CredentialNotFoundException } from "../../domain/exceptions/credential-not-found.exception";
import { InvalidCredentialsException } from "../../domain/exceptions/invalid-credentials.exception";
import { InvalidTokenException } from "../../domain/exceptions/invalid-token.exception";
import { SessionAccessDeniedException } from "../../domain/exceptions/session-access-denied.exception";
import { SessionDomainException } from "../../domain/exceptions/session-domain.exception";
import { SessionExpiredException } from "../../domain/exceptions/session-expired.exception";
import { SessionNotFoundException } from "../../domain/exceptions/session-not-found.exception";
import { TokenExpiredException } from "../../domain/exceptions/token-expired.exception";
import { TokenNotFoundException } from "../../domain/exceptions/token-not-found.exception";
import { TokenRevokedException } from "../../domain/exceptions/token-revoked.exception";
import { UsernameAlreadyExistsException } from "../../domain/exceptions/username-already-exists.exception";
import { RefreshTokenPairInput } from "../../domain/use-cases/dtos/refresh-token-pair.dto";
import { SigninInput } from "../../domain/use-cases/dtos/signin.dto";
import { SignupInput, SignupProfileInput } from "../../domain/use-cases/dtos/signup.dto";
import { SessionControllerContract } from "./contracts/session.controller.contract";

interface SigninRequestBody {
  username: string;
  password: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

interface SignupRequestBody {
  username: string;
  password: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  profile: SignupProfileInput;
}

export class SessionController extends SessionControllerContract {
  constructor(
    private readonly sessionService: SessionApplicationServiceContract,
    private readonly signupService: SignupApplicationServiceContract,
    private readonly sessionTtlSeconds: number,
  ) {
    super();
  }

  public async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as SigninRequestBody;
      const input: SigninInput = {
        username: body.username,
        password: body.password,
        expiresAt: new Date(Date.now() + this.sessionTtlSeconds * 1000),
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
      };

      const result = await this.sessionService.signin(input);

      sendSuccess(res, {
        statusCode: 200,
        message: "Sesión iniciada",
        data: result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as SignupRequestBody;
      const input: SignupInput = {
        username: body.username,
        password: body.password,
        expiresAt: new Date(Date.now() + this.sessionTtlSeconds * 1000),
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        profile: {
          fullName: body.profile.fullName,
          email: body.profile.email,
          phone: body.profile.phone,
          birthDate: body.profile.birthDate,
          gender: body.profile.gender,
        },
      };

      const result = await this.signupService.signup(input);

      sendSuccess(res, {
        statusCode: 201,
        message: "Cuenta creada y sesión iniciada",
        data: result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = this.getId(req);
      const session = await this.sessionService.getById(id);

      if (session === null) {
        sendError(res, {
          statusCode: 404,
          message: `No se encontró una sesión con id "${id}"`,
          error: "SESSION_NOT_FOUND",
        });
        return;
      }

      sendSuccess(res, {
        statusCode: 200,
        message: "Sesión encontrada",
        data: session,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentialId = Number(req.query.credentialId);
      const sessions = await this.sessionService.list(credentialId);

      sendSuccess(res, {
        statusCode: 200,
        message: "Sesiones encontradas",
        data: sessions,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async listContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentialCode = String(res.locals.credentialCode ?? "");
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const requestedLimit = Number(req.query.limit ?? 50);
      const contacts = await this.sessionService.listContacts(credentialCode, search, requestedLimit);

      sendSuccess(res, {
        statusCode: 200,
        message: "Contactos encontrados",
        data: { contacts },
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as RefreshTokenPairInput;
      const tokens = await this.sessionService.refresh(input);

      sendSuccess(res, {
        statusCode: 200,
        message: "Tokens refrescados",
        data: tokens,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await this.sessionService.revoke(this.getId(req));

      sendSuccess(res, {
        statusCode: 200,
        message: "Sesión revocada",
        data: session,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  public async updateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await this.sessionService.updateActivity(this.getId(req));

      sendSuccess(res, {
        statusCode: 200,
        message: "Actividad de la sesión actualizada",
        data: session,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private getId(req: Request): string {
    return String(req.params.id ?? "");
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof UsernameAlreadyExistsException) {
      sendError(res, {
        statusCode: 409,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (error instanceof SessionNotFoundException || error instanceof TokenNotFoundException || error instanceof CredentialNotFoundException) {
      sendError(res, {
        statusCode: 404,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (
      error instanceof InvalidCredentialsException ||
      error instanceof CredentialNotAuthenticatedException ||
      error instanceof InvalidTokenException ||
      error instanceof SessionExpiredException ||
      error instanceof TokenExpiredException ||
      error instanceof TokenRevokedException ||
      error instanceof SessionAccessDeniedException
    ) {
      sendError(res, {
        statusCode: 401,
        message: error.message,
        error: error.code,
      });
      return;
    }

    if (error instanceof SessionDomainException) {
      sendError(res, {
        statusCode: 400,
        message: error.message,
        error: error.code,
      });
      return;
    }

    next(error);
  }
}
