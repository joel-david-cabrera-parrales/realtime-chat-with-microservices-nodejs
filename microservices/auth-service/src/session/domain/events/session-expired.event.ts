import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { SESSION_EVENT_NAMES } from "../constants/session-event.constants";

export interface SessionExpiredEventProps {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  expiredAt: Date;
  occurredAt: Date;
}

export interface SessionExpiredEventPayload {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  expiredAt: string;
}

interface SessionExpiredEventState {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  expiredAt: Date;
}

export class SessionExpiredEvent extends DomainEvent {
  private readonly payload: SessionExpiredEventState;

  public constructor(props: SessionExpiredEventProps) {
    super({
      aggregateId: props.sessionId,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      sessionId: props.sessionId,
      credentialId: props.credentialId,
      profileCode: props.profileCode,
      expiredAt: new Date(props.expiredAt.getTime()),
    };
  }

  public get eventName(): string {
    return SESSION_EVENT_NAMES.expired;
  }

  public get sessionId(): string {
    return this.payload.sessionId;
  }

  public get credentialId(): number {
    return this.payload.credentialId;
  }

  public get profileCode(): string {
    return this.payload.profileCode;
  }

  public get expiredAt(): Date {
    return new Date(this.payload.expiredAt.getTime());
  }

  public toPayload(): SessionExpiredEventPayload {
    return {
      sessionId: this.payload.sessionId,
      credentialId: this.payload.credentialId,
      profileCode: this.payload.profileCode,
      expiredAt: this.payload.expiredAt.toISOString(),
    };
  }
}
