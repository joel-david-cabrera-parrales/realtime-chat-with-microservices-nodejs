import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ParticipantAddedEventProps {
  conversationCode: string;
  participantCredentialCode: string;
  role: string;
  occurredAt: Date;
}

export interface ParticipantAddedEventPayload {
  conversationCode: string;
  participantCredentialCode: string;
  role: string;
}

export class ParticipantAddedEvent extends DomainEvent {
  private readonly payload: ParticipantAddedEventPayload;

  public constructor(props: ParticipantAddedEventProps) {
    super({
      aggregateId: props.conversationCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      participantCredentialCode: props.participantCredentialCode,
      role: props.role,
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.participantAdded;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ParticipantAddedEventPayload {
    return { ...this.payload };
  }
}
