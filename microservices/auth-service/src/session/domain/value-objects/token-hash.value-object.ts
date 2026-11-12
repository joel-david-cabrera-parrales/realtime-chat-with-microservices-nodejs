import { InvalidTokenHashException } from "../exceptions/invalid-token-hash.exception";

const MAX_LENGTH = 255;

export class TokenHash {
  private constructor(private readonly hash: string) {}

  public static create(value: string): TokenHash {
    const normalized = value.trim();

    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidTokenHashException();
    }

    return new TokenHash(normalized);
  }

  public get value(): string {
    return this.hash;
  }

  public equals(other: TokenHash): boolean {
    return this.hash === other.value;
  }

  public toString(): string {
    return this.hash;
  }
}
