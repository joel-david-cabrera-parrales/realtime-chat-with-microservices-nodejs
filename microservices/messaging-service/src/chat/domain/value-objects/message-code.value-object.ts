import { randomUUID } from "node:crypto";
import { InvalidMessageCodeException } from "../exceptions/invalid-message-code.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MessageCode {
  private constructor(private readonly code: string) {}

  public static create(value: string): MessageCode {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidMessageCodeException(value);
    }

    return new MessageCode(normalized.toLowerCase());
  }

  public static generate(): MessageCode {
    return new MessageCode(randomUUID());
  }

  public get value(): string {
    return this.code;
  }

  public equals(other: MessageCode): boolean {
    return this.code === other.value;
  }

  public toString(): string {
    return this.code;
  }
}
