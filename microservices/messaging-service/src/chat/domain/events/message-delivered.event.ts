import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface MessageDeliveredEventProps {
  conversationCode: string;
  messageCode: string;
  credentialCode: string;
  deliveredAt: Date;
  occurredAt: Date;
}

export interface MessageDeliveredEventPayload {
  conversationCode: string;
  messageCode: string;
  credentialCode: string;
  deliveredAt: string;
}

export class MessageDeliveredEvent extends DomainEvent {
  private readonly payload: MessageDeliveredEventPayload;

  public constructor(props: MessageDeliveredEventProps) {
    super({
      aggregateId: props.messageCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      messageCode: props.messageCode,
      credentialCode: props.credentialCode,
      deliveredAt: props.deliveredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.messageDelivered;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public get messageCode(): string {
    return this.payload.messageCode;
  }

  public toPayload(): MessageDeliveredEventPayload {
    return { ...this.payload };
  }
}
