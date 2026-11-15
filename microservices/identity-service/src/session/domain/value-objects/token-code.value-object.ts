import { randomUUID } from "node:crypto";
import { InvalidTokenCodeException } from "../exceptions/invalid-token-code.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class TokenCode {
  private constructor(private readonly code: string) {}

  public static create(value: string): TokenCode {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidTokenCodeException(value);
    }

    return new TokenCode(normalized.toLowerCase());
  }

  public static generate(): TokenCode {
    return new TokenCode(randomUUID());
  }

  public get value(): string {
    return this.code;
  }

  public equals(other: TokenCode): boolean {
    return this.code === other.value;
  }

  public toString(): string {
    return this.code;
  }
}
