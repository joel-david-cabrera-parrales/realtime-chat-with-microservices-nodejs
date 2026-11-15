import { InvalidUsernameException } from "../exceptions/invalid-username.exception";

const MIN_LENGTH = 3;
const MAX_LENGTH = 254;
const USERNAME_PATTERN = /^[a-zA-Z0-9._@-]+$/;

export class Username {
  private constructor(private readonly username: string) {}

  public static create(value: string): Username {
    const normalized = value.trim();
    const isValidLength = normalized.length >= MIN_LENGTH && normalized.length <= MAX_LENGTH;

    if (!isValidLength || !USERNAME_PATTERN.test(normalized)) {
      throw new InvalidUsernameException(MIN_LENGTH, MAX_LENGTH);
    }

    return new Username(normalized);
  }

  public get value(): string {
    return this.username;
  }

  public equals(other: Username): boolean {
    return this.username === other.value;
  }

  public toString(): string {
    return this.username;
  }
}
