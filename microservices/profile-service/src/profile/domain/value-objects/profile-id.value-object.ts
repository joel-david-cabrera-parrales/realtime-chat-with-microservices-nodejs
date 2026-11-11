import { randomUUID } from "node:crypto";
import { InvalidProfileIdException } from "../exceptions/invalid-profile-id.exception";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ProfileId {
  private constructor(private readonly id: string) {}

  public static create(value: string): ProfileId {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidProfileIdException(value);
    }

    return new ProfileId(normalized.toLowerCase());
  }

  public static generate(): ProfileId {
    return new ProfileId(randomUUID());
  }

  public get value(): string {
    return this.id;
  }

  public equals(other: ProfileId): boolean {
    return this.id === other.value;
  }

  public toString(): string {
    return this.id;
  }
}
