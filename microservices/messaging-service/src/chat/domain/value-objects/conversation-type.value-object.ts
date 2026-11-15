import { InvalidConversationTypeException } from "../exceptions/invalid-conversation-type.exception";

export const CONVERSATION_TYPES = ["direct", "group"] as const;

export enum ConversationType {
  direct = "direct",
  group = "group",
}

const VALID_TYPES = new Set<string>(Object.values(ConversationType));

export class ConversationTypeValue {
  private constructor(private readonly type: ConversationType) {}

  public static create(value: string): ConversationTypeValue {
    if (!VALID_TYPES.has(value)) {
      throw new InvalidConversationTypeException(value);
    }

    return new ConversationTypeValue(value as ConversationType);
  }

  public static direct(): ConversationTypeValue {
    return new ConversationTypeValue(ConversationType.direct);
  }

  public static group(): ConversationTypeValue {
    return new ConversationTypeValue(ConversationType.group);
  }

  public get value(): ConversationType {
    return this.type;
  }

  public isDirect(): boolean {
    return this.type === ConversationType.direct;
  }

  public isGroup(): boolean {
    return this.type === ConversationType.group;
  }

  public equals(other: ConversationTypeValue): boolean {
    return this.type === other.value;
  }

  public toString(): string {
    return this.type;
  }
}
