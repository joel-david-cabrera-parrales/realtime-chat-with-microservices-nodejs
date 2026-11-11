import { InvalidEmailException } from "../exceptions/invalid-email.exception";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 254;

export class Email {
  private constructor(private readonly email: string) {}

  public static create(value: string): Email {
    const normalized = value.trim().toLowerCase();

    if (
      normalized.length === 0 ||
      normalized.length > MAX_LENGTH ||
      !EMAIL_PATTERN.test(normalized)
    ) {
      throw new InvalidEmailException(value);
    }

    return new Email(normalized);
  }

  public get value(): string {
    return this.email;
  }

  public equals(other: Email): boolean {
    return this.email === other.value;
  }

  public toString(): string {
    return this.email;
  }
}
