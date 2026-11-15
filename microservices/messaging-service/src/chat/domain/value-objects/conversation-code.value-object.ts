import { randomUUID } from "node:crypto";
import { InvalidConversationCodeException } from "../exceptions/invalid-conversation-code.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ConversationCode {
  private constructor(private readonly code: string) {}

  public static create(value: string): ConversationCode {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidConversationCodeException(value);
    }

    return new ConversationCode(normalized.toLowerCase());
  }

  public static generate(): ConversationCode {
    return new ConversationCode(randomUUID());
  }

  public get value(): string {
    return this.code;
  }

  public equals(other: ConversationCode): boolean {
    return this.code === other.value;
  }

  public toString(): string {
    return this.code;
  }
}
