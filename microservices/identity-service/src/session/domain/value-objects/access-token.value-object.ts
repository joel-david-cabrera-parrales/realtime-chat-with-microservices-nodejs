import { InvalidTokenException } from "../exceptions/invalid-token.exception";

export class AccessToken {
  private constructor(private readonly token: string) {}

  public static create(value: string): AccessToken {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new InvalidTokenException();
    }

    return new AccessToken(normalized);
  }

  public get value(): string {
    return this.token;
  }

  public toString(): string {
    return this.token;
  }
}
