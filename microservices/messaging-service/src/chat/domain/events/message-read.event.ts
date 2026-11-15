import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface MessageReadEventProps {
  conversationCode: string;
  messageCode: string;
  credentialCode: string;
  readAt: Date;
  occurredAt: Date;
}

export interface MessageReadEventPayload {
  conversationCode: string;
  messageCode: string;
  credentialCode: string;
  readAt: string;
}

export class MessageReadEvent extends DomainEvent {
  private readonly payload: MessageReadEventPayload;

  public constructor(props: MessageReadEventProps) {
    super({
      aggregateId: props.messageCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      messageCode: props.messageCode,
      credentialCode: props.credentialCode,
      readAt: props.readAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.messageRead;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public get messageCode(): string {
    return this.payload.messageCode;
  }

  public toPayload(): MessageReadEventPayload {
    return { ...this.payload };
  }
}
