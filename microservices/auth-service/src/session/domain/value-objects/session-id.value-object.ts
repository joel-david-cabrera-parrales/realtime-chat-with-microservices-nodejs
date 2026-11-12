import { randomUUID } from "node:crypto";
import { InvalidSessionIdException } from "../exceptions/invalid-session-id.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class SessionId {
  private constructor(private readonly id: string) {}

  public static create(value: string): SessionId {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidSessionIdException(value);
    }

    return new SessionId(normalized.toLowerCase());
  }

  public static generate(): SessionId {
    return new SessionId(randomUUID());
  }

  public get value(): string {
    return this.id;
  }

  public equals(other: SessionId): boolean {
    return this.id === other.value;
  }

  public toString(): string {
    return this.id;
  }
}
