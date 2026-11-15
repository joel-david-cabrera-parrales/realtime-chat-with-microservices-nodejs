import { InvalidBioException } from "../exceptions/invalid-bio.exception";

const MAX_LENGTH = 500;

export class Bio {
  private constructor(private readonly text: string) {}

  public static create(value: string): Bio {
    const normalized = value.trim();

    if (normalized.length > MAX_LENGTH) {
      throw new InvalidBioException(MAX_LENGTH);
    }

    return new Bio(normalized);
  }

  public get value(): string {
    return this.text;
  }

  public get isEmpty(): boolean {
    return this.text.length === 0;
  }

  public equals(other: Bio): boolean {
    return this.text === other.value;
  }

  public toString(): string {
    return this.text;
  }
}
