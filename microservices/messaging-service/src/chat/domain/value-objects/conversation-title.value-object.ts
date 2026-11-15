import { InvalidConversationTitleException } from "../exceptions/invalid-conversation-title.exception";

const MIN_LENGTH = 3;
const MAX_LENGTH = 80;

export class ConversationTitle {
  private constructor(private readonly title: string) {}

  public static create(value: string): ConversationTitle {
    const normalized = value.trim();

    if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
      throw new InvalidConversationTitleException(value);
    }

    return new ConversationTitle(normalized);
  }

  public get value(): string {
    return this.title;
  }

  public equals(other: ConversationTitle): boolean {
    return this.title === other.value;
  }

  public toString(): string {
    return this.title;
  }
}
