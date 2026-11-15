import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface MessageUpdatedEventProps {
  conversationCode: string;
  messageCode: string;
  content: string;
  editedAt: Date;
  occurredAt: Date;
}

export interface MessageUpdatedEventPayload {
  conversationCode: string;
  messageCode: string;
  content: string;
  editedAt: string;
}

export class MessageUpdatedEvent extends DomainEvent {
  private readonly payload: MessageUpdatedEventPayload;

  public constructor(props: MessageUpdatedEventProps) {
    super({
      aggregateId: props.messageCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      messageCode: props.messageCode,
      content: props.content,
      editedAt: props.editedAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.messageUpdated;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public get messageCode(): string {
    return this.payload.messageCode;
  }

  public toPayload(): MessageUpdatedEventPayload {
    return { ...this.payload };
  }
}
