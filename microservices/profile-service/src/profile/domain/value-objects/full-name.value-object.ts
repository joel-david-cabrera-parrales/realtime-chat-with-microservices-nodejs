import { InvalidFullNameException } from "../exceptions/invalid-full-name.exception";

const MIN_LENGTH = 2;
const MAX_LENGTH = 120;

export class FullName {
  private constructor(private readonly name: string) {}

  public static create(value: string): FullName {
    const normalized = value.trim().replace(/\s+/g, " ");
    const hasLetter = /\p{L}/u.test(normalized);
    const hasValidLength =
      normalized.length >= MIN_LENGTH && normalized.length <= MAX_LENGTH;

    if (!hasLetter || !hasValidLength) {
      throw new InvalidFullNameException(MIN_LENGTH, MAX_LENGTH);
    }

    return new FullName(normalized);
  }

  public get value(): string {
    return this.name;
  }

  public equals(other: FullName): boolean {
    return this.name === other.value;
  }

  public toString(): string {
    return this.name;
  }
}
