import { NextFunction, Request, Response } from "express";
import { sendError, sendSuccess } from "../../../shared/http/api-response";
import { EnvAdapter } from "../../../plugins/env/env.adapter";
import { OAuthApplicationServiceContract } from "../../application/contracts/oauth.application.service.contract";
import { OAuthLoginOutput } from "../../domain/use-cases/dtos/oauth.dto";
import { OAuthControllerContract } from "./contracts/oauth.controller.contract";
import { OAuthPassportProvider, OAuthProvider } from "../oauth/passport-oauth.provider";
import { OAuthPrincipal } from "../oauth/oauth-principal.interface";

export class OAuthController extends OAuthControllerContract {
  private readonly env: EnvAdapter;

  constructor(
    private readonly oauthService: OAuthApplicationServiceContract,
    private readonly passportProvider: OAuthPassportProvider,
    private readonly sessionTtlSeconds: number,
  ) {
    super();
    this.env = new EnvAdapter();
  }

  public async google(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.begin("google", req, res, next);
  }

  public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.complete("google", req, res, next);
  }

  public async microsoft(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.begin("microsoft", req, res, next);
  }

  public async microsoftCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.complete("microsoft", req, res, next);
  }

  private begin(provider: OAuthProvider, req: Request, res: Response, next: NextFunction): void {
    if (!this.passportProvider.isProviderEnabled(provider)) {
      sendError(res, {
        statusCode: 503,
        message: `El proveedor de "${provider}" no está configurado`,
        error: "OAUTH_PROVIDER_NOT_CONFIGURED",
      });
      return;
    }

    this.passportProvider.redirect(provider)(req, res, next);
  }

  private complete(provider: OAuthProvider, req: Request, res: Response, next: NextFunction): void {
    if (!this.passportProvider.isProviderEnabled(provider)) {
      sendError(res, {
        statusCode: 503,
        message: `El proveedor de "${provider}" no está configurado`,
        error: "OAUTH_PROVIDER_NOT_CONFIGURED",
      });
      return;
    }

    const handler = this.passportProvider.authenticate(provider, (error, principal, info) => {
      if (error !== null) {
        next(error);
        return;
      }

      if (principal === false || principal === undefined || principal === null) {
        const message = this.readInfoMessage(info) ?? "No se pudo autenticar con el proveedor";
        sendError(res, {
          statusCode: 401,
          message,
          error: "OAUTH_AUTHENTICATION_FAILED",
        });
        return;
      }

      this.login(principal, req, res, next);
    });

    handler(req, res, next);
  }

  private login(principal: OAuthPrincipal, req: Request, res: Response, next: NextFunction): void {
    void (async () => {
      try {
        const result = await this.oauthService.login({
          email: principal.email,
          fullName: principal.fullName,
          authenticationType: principal.authenticationType,
          expiresAt: new Date(Date.now() + this.sessionTtlSeconds * 1000),
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });

        this.respond(res, result);
      } catch (error) {
        next(error);
      }
    })();
  }

  private respond(res: Response, result: OAuthLoginOutput): void {
    const redirectTo = this.env.getOptional("OAUTH_REDIRECT_URL");

    if (redirectTo === undefined || redirectTo.length === 0) {
      sendSuccess(res, {
        statusCode: 200,
        message: "Sesión iniciada",
        data: result,
      });
      return;
    }

    const url = new URL(redirectTo);
    url.searchParams.set("accessToken", result.tokens.accessToken);
    url.searchParams.set("refreshToken", result.tokens.refreshToken);

    res.redirect(302, url.toString());
  }

  private readInfoMessage(info: unknown): string | undefined {
    if (typeof info === "object" && info !== null && "message" in info) {
      const message = (info as { message: unknown }).message;
      return typeof message === "string" ? message : undefined;
    }

    return undefined;
  }
}
