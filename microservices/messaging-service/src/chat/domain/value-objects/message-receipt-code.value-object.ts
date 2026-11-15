import { randomUUID } from "node:crypto";
import { InvalidMessageReceiptCodeException } from "../exceptions/invalid-message-receipt-code.exception";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MessageReceiptCode {
  private constructor(private readonly code: string) {}

  public static create(value: string): MessageReceiptCode {
    const normalized = value.trim();

    if (!UUID_PATTERN.test(normalized)) {
      throw new InvalidMessageReceiptCodeException(value);
    }

    return new MessageReceiptCode(normalized.toLowerCase());
  }

  public static generate(): MessageReceiptCode {
    return new MessageReceiptCode(randomUUID());
  }

  public get value(): string {
    return this.code;
  }

  public equals(other: MessageReceiptCode): boolean {
    return this.code === other.value;
  }

  public toString(): string {
    return this.code;
  }
}
