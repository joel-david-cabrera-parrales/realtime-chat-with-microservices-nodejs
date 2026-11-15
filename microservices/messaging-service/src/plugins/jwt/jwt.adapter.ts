import jwt, { SignOptions } from "jsonwebtoken";
import { TokenService } from "../../shared/domain/token.generator.service";

export interface JwtAdapterOptions {
  secret: string;
  refreshSecret?: string | undefined;
  expiresIn?: NonNullable<SignOptions["expiresIn"]>;
  refreshExpiresIn?: NonNullable<SignOptions["expiresIn"]>;
}

export class JwtAdapter extends TokenService {
  private readonly secret: string;
  private readonly refreshSecret: string | undefined;
  private readonly expiresIn: NonNullable<SignOptions["expiresIn"]>;
  private readonly refreshExpiresIn: NonNullable<SignOptions["expiresIn"]>;

  constructor(options: JwtAdapterOptions) {
    super();
    this.secret = options.secret;
    this.refreshSecret = options.refreshSecret;
    this.expiresIn = options.expiresIn ?? "15m";
    this.refreshExpiresIn = options.refreshExpiresIn ?? "7d";
  }

  public generateToken(data: Record<string, unknown>): string {
    return jwt.sign(data, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  public verifyToken(token: string): Record<string, unknown> {
    return jwt.verify(token, this.secret) as Record<string, unknown>;
  }

  public generateRefreshToken(data: Record<string, unknown>): string {
    return jwt.sign(data, this.refreshSecret ?? this.secret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  public verifyRefreshToken(token: string): Record<string, unknown> {
    return jwt.verify(token, this.refreshSecret ?? this.secret) as Record<string, unknown>;
  }
}
