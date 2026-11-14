import { DomainEvent } from "../../../shared/domain/events/domain-event";
import { InvalidCredentialIdException } from "../exceptions/invalid-credential-id.exception";
import { InvalidSessionExpirationException } from "../exceptions/invalid-session-expiration.exception";
import { SessionExpiredException } from "../exceptions/session-expired.exception";
import { SessionCreatedEvent } from "../events/session-created.event";
import { SessionExpiredEvent } from "../events/session-expired.event";
import { SessionRevokedEvent } from "../events/session-revoked.event";
import { CreateSessionProps, RehydrateSessionProps, SessionPrimitives, SessionProps } from "../interfaces/session.interface";
import { SessionStateMachine } from "../state-machine/session.state-machine";
import { IpAddress } from "../value-objects/ip-address.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { SessionId } from "../value-objects/session-id.value-object";
import { SessionStatus, SessionStatusValue } from "../value-objects/session-status.value-object";
import { UserAgent } from "../value-objects/user-agent.value-object";

export class Session {
  private readonly events: DomainEvent[] = [];

  private constructor(private readonly props: SessionProps) {}

  public static create(props: CreateSessionProps): Session {
    const now = new Date();

    if (props.expiresAt.getTime() <= now.getTime()) {
      throw new InvalidSessionExpirationException();
    }

    const session = new Session({
      id: SessionId.generate(),
      credentialId: Session.validateCredentialId(props.credentialId),
      profileCode: ProfileCode.create(props.profileCode),
      status: SessionStatusValue.active(),
      ipAddress: props.ipAddress === undefined ? undefined : IpAddress.create(props.ipAddress),
      userAgent: props.userAgent === undefined ? undefined : UserAgent.create(props.userAgent),
      lastActivityAt: now,
      expiresAt: new Date(props.expiresAt.getTime()),
      revokedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });

    session.recordEvent(
      new SessionCreatedEvent({
        sessionId: session.props.id.value,
        credentialId: session.props.credentialId,
        profileCode: session.props.profileCode.value,
        expiresAt: session.props.expiresAt,
        occurredAt: now,
      }),
    );

    return session;
  }

  public static rehydrate(props: RehydrateSessionProps): Session {
    return new Session({
      id: SessionId.create(props.id),
      credentialId: Session.validateCredentialId(props.credentialId),
      profileCode: ProfileCode.create(props.profileCode),
      status: SessionStatusValue.create(props.status),
      ipAddress: props.ipAddress === null ? undefined : IpAddress.create(props.ipAddress),
      userAgent: props.userAgent === null ? undefined : UserAgent.create(props.userAgent),
      lastActivityAt: new Date(props.lastActivityAt.getTime()),
      expiresAt: new Date(props.expiresAt.getTime()),
      revokedAt: props.revokedAt === null ? undefined : new Date(props.revokedAt.getTime()),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get id(): SessionId {
    return this.props.id;
  }

  public get credentialId(): number {
    return this.props.credentialId;
  }

  public get profileCode(): ProfileCode {
    return this.props.profileCode;
  }

  public get status(): SessionStatusValue {
    return this.props.status;
  }

  public get ipAddress(): IpAddress | undefined {
    return this.props.ipAddress;
  }

  public get userAgent(): UserAgent | undefined {
    return this.props.userAgent;
  }

  public get lastActivityAt(): Date {
    return new Date(this.props.lastActivityAt.getTime());
  }

  public get expiresAt(): Date {
    return new Date(this.props.expiresAt.getTime());
  }

  public get revokedAt(): Date | undefined {
    const revokedAt = this.props.revokedAt;
    return revokedAt === undefined ? undefined : new Date(revokedAt.getTime());
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public isActive(now: Date = new Date()): boolean {
    return this.props.status.isActive() && this.props.expiresAt.getTime() > now.getTime();
  }

  public expireIfNeeded(now: Date = new Date()): boolean {
    if (!this.props.status.isActive()) {
      return false;
    }

    if (this.props.expiresAt.getTime() > now.getTime()) {
      return false;
    }

    this.transitionTo(SessionStatus.expired, now);
    return true;
  }

  public expire(now: Date = new Date()): void {
    this.transitionTo(SessionStatus.expired, now);
  }

  public revoke(now: Date = new Date()): void {
    this.expireIfNeeded(now);
    this.transitionTo(SessionStatus.revoked, now);
  }

  public touch(now: Date = new Date()): void {
    this.expireIfNeeded(now);

    if (!this.props.status.isActive()) {
      throw new SessionExpiredException();
    }

    this.props.lastActivityAt = now;
    this.props.updatedAt = now;
  }

  public hasEvents(): boolean {
    return this.events.length > 0;
  }

  public pullEvents(): DomainEvent[] {
    const pending = [...this.events];
    this.events.length = 0;
    return pending;
  }

  public equals(other: Session): boolean {
    return this.props.id.equals(other.id);
  }

  public toPrimitives(): SessionPrimitives {
    return {
      id: this.props.id.value,
      credentialId: this.props.credentialId,
      profileCode: this.props.profileCode.value,
      status: this.props.status.value,
      ipAddress: this.props.ipAddress?.value ?? null,
      userAgent: this.props.userAgent?.value ?? null,
      lastActivityAt: this.props.lastActivityAt.toISOString(),
      expiresAt: this.props.expiresAt.toISOString(),
      revokedAt: this.props.revokedAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private transitionTo(next: SessionStatus, at: Date): void {
    SessionStateMachine.assertTransition(this.props.status.value, next);

    this.props.status = SessionStatusValue.create(next);

    if (next === SessionStatus.revoked) {
      this.props.revokedAt = at;
    }

    this.props.updatedAt = at;

    this.recordTransitionEvent(next, at);
  }

  private recordTransitionEvent(next: SessionStatus, at: Date): void {
    if (next === SessionStatus.expired) {
      this.recordEvent(
        new SessionExpiredEvent({
          sessionId: this.props.id.value,
          credentialId: this.props.credentialId,
          profileCode: this.props.profileCode.value,
          expiredAt: at,
          occurredAt: at,
        }),
      );
      return;
    }

    if (next === SessionStatus.revoked) {
      this.recordEvent(
        new SessionRevokedEvent({
          sessionId: this.props.id.value,
          credentialId: this.props.credentialId,
          profileCode: this.props.profileCode.value,
          revokedAt: at,
          occurredAt: at,
        }),
      );
    }
  }

  private recordEvent(event: DomainEvent): void {
    this.events.push(event);
  }

  private static validateCredentialId(value: number): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidCredentialIdException();
    }

    return value;
  }
}
