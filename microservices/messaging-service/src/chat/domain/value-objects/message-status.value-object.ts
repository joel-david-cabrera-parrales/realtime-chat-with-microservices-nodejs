import { InvalidMessageStatusException } from "../exceptions/invalid-message-status.exception";

export enum MessageStatus {
  sent = "sent",
  delivered = "delivered",
  read = "read",
}

const VALID_STATUSES = new Set<string>(Object.values(MessageStatus));

export class MessageStatusValue {
  private constructor(private readonly status: MessageStatus) {}

  public static create(value: string): MessageStatusValue {
    if (!VALID_STATUSES.has(value)) {
      throw new InvalidMessageStatusException(value);
    }

    return new MessageStatusValue(value as MessageStatus);
  }

  public static sent(): MessageStatusValue {
    return new MessageStatusValue(MessageStatus.sent);
  }

  public static delivered(): MessageStatusValue {
    return new MessageStatusValue(MessageStatus.delivered);
  }

  public static read(): MessageStatusValue {
    return new MessageStatusValue(MessageStatus.read);
  }

  public get value(): MessageStatus {
    return this.status;
  }

  public isSent(): boolean {
    return this.status === MessageStatus.sent;
  }

  public isDelivered(): boolean {
    return this.status === MessageStatus.delivered;
  }

  public isRead(): boolean {
    return this.status === MessageStatus.read;
  }

  public equals(other: MessageStatusValue): boolean {
    return this.status === other.value;
  }

  public toString(): string {
    return this.status;
  }
}
