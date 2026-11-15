import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ConversationDeletedEventProps {
  conversationCode: string;
  occurredAt: Date;
}

export interface ConversationDeletedEventPayload {
  conversationCode: string;
}

export class ConversationDeletedEvent extends DomainEvent {
  private readonly payload: ConversationDeletedEventPayload;

  public constructor(props: ConversationDeletedEventProps) {
    super({
      aggregateId: props.conversationCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.conversationDeleted;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ConversationDeletedEventPayload {
    return { ...this.payload };
  }
}
