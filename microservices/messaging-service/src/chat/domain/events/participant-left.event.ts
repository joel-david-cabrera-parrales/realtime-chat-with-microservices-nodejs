import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ParticipantLeftEventProps {
  conversationCode: string;
  participantCredentialCode: string;
  occurredAt: Date;
}

export interface ParticipantLeftEventPayload {
  conversationCode: string;
  participantCredentialCode: string;
}

export class ParticipantLeftEvent extends DomainEvent {
  private readonly payload: ParticipantLeftEventPayload;

  public constructor(props: ParticipantLeftEventProps) {
    super({
      aggregateId: props.conversationCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      conversationCode: props.conversationCode,
      participantCredentialCode: props.participantCredentialCode,
    };
  }

  public get eventName(): string {
    return CHAT_EVENT_NAMES.participantLeft;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ParticipantLeftEventPayload {
    return { ...this.payload };
  }
}
