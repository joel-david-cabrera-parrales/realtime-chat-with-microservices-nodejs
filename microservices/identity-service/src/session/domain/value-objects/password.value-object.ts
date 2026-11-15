import { InvalidPasswordException } from "../exceptions/invalid-password.exception";

const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

export class Password {
  private constructor(private readonly password: string) {}

  public static create(value: string): Password {
    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new InvalidPasswordException(MIN_LENGTH, MAX_LENGTH);
    }

    return new Password(value);
  }

  public get value(): string {
    return this.password;
  }

  public toString(): string {
    return this.password;
  }
}
