import { InvalidTokenException } from "../exceptions/invalid-token.exception";

export class RefreshToken {
  private constructor(private readonly token: string) {}

  public static create(value: string): RefreshToken {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new InvalidTokenException();
    }

    return new RefreshToken(normalized);
  }

  public get value(): string {
    return this.token;
  }

  public toString(): string {
    return this.token;
  }
}
