import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ConversationRenamedEventProps {
  conversationCode: string;
  title: string;
  occurredAt: Date;
}

export interface ConversationRenamedEventPayload {
  conversationCode: string;
  title: string;
}

export class ConversationRenamedEvent extends DomainEvent {
  private readonly payload: ConversationRenamedEventPayload;

  public constructor(props: ConversationRenamedEventProps) {
    super({
      aggregateId: props.conversationCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      title: props.title,
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.conversationRenamed;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ConversationRenamedEventPayload {
    return { ...this.payload };
  }
}
