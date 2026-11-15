import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { CHAT_EVENT_NAMES } from "../constants/chat-event.constants";

export interface ParticipantRemovedEventProps {
  conversationCode: string;
  participantCredentialCode: string;
  occurredAt: Date;
}

export interface ParticipantRemovedEventPayload {
  conversationCode: string;
  participantCredentialCode: string;
}

export class ParticipantRemovedEvent extends DomainEvent {
  private readonly payload: ParticipantRemovedEventPayload;

  public constructor(props: ParticipantRemovedEventProps) {
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
    return CHAT_EVENT_NAMES.participantRemoved;
  }

  public get conversationCode(): string {
    return this.payload.conversationCode;
  }

  public toPayload(): ParticipantRemovedEventPayload {
    return { ...this.payload };
  }
}
