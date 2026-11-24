import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { SESSION_EVENT_NAMES } from "../constants/session-event.constants";

export interface SessionCreatedEventProps {
  sessionId: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  expiresAt: Date;
  occurredAt: Date;
}

export interface SessionCreatedEventPayload {
  sessionId: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  expiresAt: string;
}

interface SessionCreatedEventState {
  sessionId: string;
  credentialId: number;
  credentialCode: string;
  profileCode: string;
  expiresAt: Date;
}

export class SessionCreatedEvent extends DomainEvent {
  private readonly payload: SessionCreatedEventState;

  public constructor(props: SessionCreatedEventProps) {
    super({
      aggregateId: props.sessionId,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      sessionId: props.sessionId,
      credentialId: props.credentialId,
      credentialCode: props.credentialCode,
      profileCode: props.profileCode,
      expiresAt: new Date(props.expiresAt.getTime()),
    };
  }

  public get eventName(): string {
    return SESSION_EVENT_NAMES.created;
  }

  public get sessionId(): string {
    return this.payload.sessionId;
  }

  public get credentialId(): number {
    return this.payload.credentialId;
  }

  public get credentialCode(): string {
    return this.payload.credentialCode;
  }

  public get profileCode(): string {
    return this.payload.profileCode;
  }

  public get expiresAt(): Date {
    return new Date(this.payload.expiresAt.getTime());
  }

  public toPayload(): SessionCreatedEventPayload {
    return {
      sessionId: this.payload.sessionId,
      credentialId: this.payload.credentialId,
      credentialCode: this.payload.credentialCode,
      profileCode: this.payload.profileCode,
      expiresAt: this.payload.expiresAt.toISOString(),
    };
  }
}