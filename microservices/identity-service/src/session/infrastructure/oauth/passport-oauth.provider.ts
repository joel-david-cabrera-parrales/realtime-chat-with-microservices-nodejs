import { RequestHandler } from "express";
import { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { EnvAdapter } from "../../../plugins/env/env.adapter";
import { AuthenticationTypeCode } from "../../domain/constants/authentication-type.constants";
import { OAuthPrincipal } from "./oauth-principal.interface";

export type OAuthProvider = "google" | "microsoft";

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
}

const GOOGLE_SCOPES = ["profile", "email"];
const MICROSOFT_SCOPES = ["openid", "profile", "email", "offline_access", "User.Read"];

export class OAuthPassportProvider {
  private readonly env: EnvAdapter;
  private readonly enabled: Partial<Record<OAuthProvider, true>> = {};

  constructor(private readonly passport: PassportStatic) {
    this.env = new EnvAdapter();
    this.register();
  }

  public isProviderEnabled(provider: OAuthProvider): boolean {
    return this.enabled[provider] === true;
  }

  public redirect(provider: OAuthProvider): RequestHandler {
    return this.passport.authenticate(provider, this.buildOptions(provider)) as unknown as RequestHandler;
  }

  public authenticate(
    provider: OAuthProvider,
    callback: (error: Error | null, principal: OAuthPrincipal | false, info?: unknown) => void,
  ): RequestHandler {
    return this.passport.authenticate(provider, this.buildOptions(provider), callback as never) as unknown as RequestHandler;
  }

  private buildOptions(provider: OAuthProvider): Record<string, unknown> {
    return {
      session: false,
      state: true,
      scope: provider === "google" ? GOOGLE_SCOPES : MICROSOFT_SCOPES,
    };
  }

  private register(): void {
    const google = this.readConfig("GOOGLE");

    if (google !== null) {
      this.passport.use(
        "google",
        new GoogleStrategy(
          {
            clientID: google.clientId,
            clientSecret: google.clientSecret,
            callbackURL: google.callbackURL,
          },
          (_accessToken, _refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value;

            if (email === undefined) {
              return done(null, false, { message: "Google no devolvió un email verificado" });
            }

            done(null, this.buildPrincipal(email, profile.displayName, AuthenticationTypeCode.google), undefined);
          },
        ),
      );
      this.enabled.google = true;
    }

    const microsoft = this.readConfig("MICROSOFT");

    if (microsoft !== null) {
      const tenant = this.env.getString("MICROSOFT_TENANT_ID", "common");

      this.passport.use(
        "microsoft",
        new MicrosoftStrategy(
          {
            clientID: microsoft.clientId,
            clientSecret: microsoft.clientSecret,
            callbackURL: microsoft.callbackURL,
            tenant,
          },
          (_accessToken: string, _refreshToken: string, profile: any, done: (error: Error | null, user?: unknown, info?: unknown) => void) => {
            const json = (profile._json ?? {}) as Record<string, string>;
            const email = (profile.emails?.[0]?.value ?? json.mail ?? json.userPrincipalName) as string | undefined;

            if (typeof email !== "string") {
              done(null, false, { message: "Microsoft no devolvió un email" });
              return;
            }

            const fullName = profile.displayName ?? json.displayName ?? email;

            done(null, this.buildPrincipal(email, fullName, AuthenticationTypeCode.microsoft), undefined);
          },
        ),
      );
      this.enabled.microsoft = true;
    }
  }

  private buildPrincipal(email: string, fullName: string, authenticationType: AuthenticationTypeCode): OAuthPrincipal {
    return { email, fullName, authenticationType };
  }

  private readConfig(prefix: string): ProviderConfig | null {
    const clientId = this.env.getOptional(`${prefix}_CLIENT_ID`);
    const clientSecret = this.env.getOptional(`${prefix}_CLIENT_SECRET`);
    const callbackURL = this.env.getOptional(`${prefix}_CALLBACK_URL`);

    if (clientId === undefined || clientSecret === undefined || callbackURL === undefined) {
      return null;
    }

    return { clientId, clientSecret, callbackURL };
  }
}
