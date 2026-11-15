import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface MessageDeletedEventProps {
  conversationCode: string;
  messageCode: string;
  deletedBy: string;
  deletedAt: Date;
  occurredAt: Date;
}

export interface MessageDeletedEventPayload {
  conversationCode: string;
  messageCode: string;
  deletedBy: string;
  deletedAt: string;
}

export class MessageDeletedEvent extends DomainEvent {
  private readonly payload: MessageDeletedEventPayload;

  public constructor(props: MessageDeletedEventProps) {
    super({
      aggregateId: props.messageCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      messageCode: props.messageCode,
      deletedBy: props.deletedBy,
      deletedAt: props.deletedAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.messageDeleted;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public get messageCode(): string {
    return this.payload.messageCode;
  }

  public toPayload(): MessageDeletedEventPayload {
    return { ...this.payload };
  }
}
