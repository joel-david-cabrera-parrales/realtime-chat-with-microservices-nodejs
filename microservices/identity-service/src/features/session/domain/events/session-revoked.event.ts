import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { SESSION_EVENT_NAMES } from "../constants/session-event.constants";

export interface SessionRevokedEventProps {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  revokedAt: Date;
  reason?: string | undefined;
  occurredAt: Date;
}

export interface SessionRevokedEventPayload {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  revokedAt: string;
  reason: string | null;
}

interface SessionRevokedEventState {
  sessionId: string;
  credentialId: number;
  profileCode: string;
  revokedAt: Date;
  reason: string | undefined;
}

export class SessionRevokedEvent extends DomainEvent {
  private readonly payload: SessionRevokedEventState;

  public constructor(props: SessionRevokedEventProps) {
    super({
      aggregateId: props.sessionId,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      sessionId: props.sessionId,
      credentialId: props.credentialId,
      profileCode: props.profileCode,
      revokedAt: new Date(props.revokedAt.getTime()),
      reason: props.reason,
    };
  }

  public get eventName(): string {
    return SESSION_EVENT_NAMES.revoked;
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

  public get revokedAt(): Date {
    return new Date(this.payload.revokedAt.getTime());
  }

  public get reason(): string | undefined {
    return this.payload.reason;
  }

  public toPayload(): SessionRevokedEventPayload {
    return {
      sessionId: this.payload.sessionId,
      credentialId: this.payload.credentialId,
      profileCode: this.payload.profileCode,
      revokedAt: this.payload.revokedAt.toISOString(),
      reason: this.payload.reason ?? null,
    };
  }
}
