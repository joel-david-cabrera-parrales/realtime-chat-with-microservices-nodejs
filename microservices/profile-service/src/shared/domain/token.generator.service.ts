export abstract class TokenService {
  public abstract generateAccessToken(data: Record<string, unknown>): string;
  public abstract verifyAccessToken(token: string): Record<string, unknown>;
  public abstract generateRefreshToken(data: Record<string, unknown>): string;
  public abstract verifyRefreshToken(token: string): Record<string, unknown>;
}
