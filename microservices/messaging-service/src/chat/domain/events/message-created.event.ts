import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface MessageCreatedEventProps {
  conversationCode: string;
  messageCode: string;
  senderCredentialCode: string;
  content: string;
  createdAt: Date;
  occurredAt: Date;
}

export interface MessageCreatedEventPayload {
  conversationCode: string;
  messageCode: string;
  senderCredentialCode: string;
  content: string;
  createdAt: string;
}

export class MessageCreatedEvent extends DomainEvent {
  private readonly payload: MessageCreatedEventPayload;

  public constructor(props: MessageCreatedEventProps) {
    super({
      aggregateId: props.messageCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      messageCode: props.messageCode,
      senderCredentialCode: props.senderCredentialCode,
      content: props.content,
      createdAt: props.createdAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.messageCreated;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public get messageCode(): string {
    return this.payload.messageCode;
  }

  public toPayload(): MessageCreatedEventPayload {
    return { ...this.payload };
  }
}
