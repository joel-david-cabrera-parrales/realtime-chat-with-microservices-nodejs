import jwt, { SignOptions } from "jsonwebtoken";
import { TokenService } from "../../shared/domain/services/token.generator.service";

export interface JwtAdapterOptions {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn?: NonNullable<SignOptions["expiresIn"]>;
  refreshExpiresIn?: NonNullable<SignOptions["expiresIn"]>;
}

export class JwtAdapter extends TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: NonNullable<SignOptions["expiresIn"]>;
  private readonly refreshExpiresIn: NonNullable<SignOptions["expiresIn"]>;

  constructor(options: JwtAdapterOptions) {
    super();
    this.accessSecret = options.accessSecret;
    this.refreshSecret = options.refreshSecret;
    this.accessExpiresIn = options.accessExpiresIn ?? "15m";
    this.refreshExpiresIn = options.refreshExpiresIn ?? "7d";
  }

  public generateAccessToken(data: Record<string, unknown>): string {
    return jwt.sign(data, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  public verifyAccessToken(token: string): Record<string, unknown> {
    return jwt.verify(token, this.accessSecret) as Record<string, unknown>;
  }

  public generateRefreshToken(data: Record<string, unknown>): string {
    return jwt.sign(data, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  public verifyRefreshToken(token: string): Record<string, unknown> {
    return jwt.verify(token, this.refreshSecret) as Record<string, unknown>;
  }
}
