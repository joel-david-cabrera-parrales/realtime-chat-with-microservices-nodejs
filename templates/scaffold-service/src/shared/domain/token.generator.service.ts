export abstract class TokenService {
  public abstract generateToken(data: Record<string, unknown>): string;
  public abstract verifyToken(token: string): Record<string, unknown>;
}
