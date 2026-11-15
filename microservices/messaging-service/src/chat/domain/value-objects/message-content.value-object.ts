import { InvalidMessageContentException } from "../exceptions/invalid-message-content.exception";

const MAX_LENGTH = 4096;

export class MessageContent {
  private constructor(private readonly content: string) {}

  public static create(value: string): MessageContent {
    const normalized = value.trim();

    if (normalized.length === 0 || normalized.length > MAX_LENGTH) {
      throw new InvalidMessageContentException(value);
    }

    return new MessageContent(normalized);
  }

  public get value(): string {
    return this.content;
  }

  public equals(other: MessageContent): boolean {
    return this.content === other.value;
  }

  public toString(): string {
    return this.content;
  }
}
