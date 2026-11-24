import { InvalidPasswordHashException } from "../exceptions/invalid-password-hash.exception";

const MAX_LENGTH = 255;

export class PasswordHash {
  private constructor(private readonly hash: string) {}

  public static create(value: string): PasswordHash {
    const normalized = value.trim();

    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidPasswordHashException();
    }

    return new PasswordHash(normalized);
  }

  public get value(): string {
    return this.hash;
  }

  public equals(other: PasswordHash): boolean {
    return this.hash === other.value;
  }

  public toString(): string {
    return this.hash;
  }
}
