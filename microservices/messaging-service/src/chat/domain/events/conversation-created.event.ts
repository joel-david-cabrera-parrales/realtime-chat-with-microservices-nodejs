import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ConversationCreatedEventProps {
  conversationCode: string;
  type: string;
  title: string | null;
  createdBy: string;
  participantCredentialCodes: string[];
  occurredAt: Date;
}

export interface ConversationCreatedEventPayload {
  conversationCode: string;
  type: string;
  title: string | null;
  createdBy: string;
  participantCredentialCodes: string[];
}

export class ConversationCreatedEvent extends DomainEvent {
  private readonly payload: ConversationCreatedEventPayload;

  public constructor(props: ConversationCreatedEventProps) {
    super({
      aggregateId: props.conversationCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      type: props.type,
      title: props.title,
      createdBy: props.createdBy,
      participantCredentialCodes: props.participantCredentialCodes,
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.conversationCreated;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ConversationCreatedEventPayload {
    return { ...this.payload, participantCredentialCodes: [...this.payload.participantCredentialCodes] };
  }
}
