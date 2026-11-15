import { InvalidCredentialIdException } from "../exceptions/invalid-credential-id.exception";
import { InvalidTokenExpirationException } from "../exceptions/invalid-token-expiration.exception";
import { TokenExpiredException } from "../exceptions/token-expired.exception";
import { CreateTokenProps, RehydrateTokenProps, TokenPrimitives, TokenProps } from "../interfaces/token.interface";
import { TokenStateMachine } from "../state-machine/token.state-machine";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { SessionId } from "../value-objects/session-id.value-object";
import { TokenCode } from "../value-objects/token-code.value-object";
import { TokenHash } from "../value-objects/token-hash.value-object";
import { TokenStatus, TokenStatusValue } from "../value-objects/token-status.value-object";

export class Token {
  private constructor(private readonly props: TokenProps) {}

  public static create(props: CreateTokenProps): Token {
    const now = new Date();

    if (props.expiresAt.getTime() <= now.getTime()) {
      throw new InvalidTokenExpirationException();
    }

    return new Token({
      code: TokenCode.generate(),
      sessionId: SessionId.create(props.sessionId),
      credentialId: Token.validateCredentialId(props.credentialId),
      profileCode: ProfileCode.create(props.profileCode),
      status: TokenStatusValue.active(),
      hash: TokenHash.create(props.hash),
      expiresAt: new Date(props.expiresAt.getTime()),
      revokedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static rehydrate(props: RehydrateTokenProps): Token {
    return new Token({
      code: TokenCode.create(props.tokenCode),
      sessionId: SessionId.create(props.sessionId),
      credentialId: Token.validateCredentialId(props.credentialId),
      profileCode: ProfileCode.create(props.profileCode),
      status: TokenStatusValue.create(props.status),
      hash: TokenHash.create(props.hash),
      expiresAt: new Date(props.expiresAt.getTime()),
      revokedAt: props.revokedAt === null ? undefined : new Date(props.revokedAt.getTime()),
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get code(): TokenCode {
    return this.props.code;
  }

  public get sessionId(): SessionId {
    return this.props.sessionId;
  }

  public get credentialId(): number {
    return this.props.credentialId;
  }

  public get profileCode(): ProfileCode {
    return this.props.profileCode;
  }

  public get status(): TokenStatusValue {
    return this.props.status;
  }

  public get hash(): TokenHash {
    return this.props.hash;
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

    this.transitionTo(TokenStatus.expired, now);
    return true;
  }

  public expire(now: Date = new Date()): void {
    this.transitionTo(TokenStatus.expired, now);
  }

  public revoke(now: Date = new Date()): void {
    this.expireIfNeeded(now);
    this.transitionTo(TokenStatus.revoked, now);
  }

  public touch(now: Date = new Date()): void {
    this.expireIfNeeded(now);

    if (!this.props.status.isActive()) {
      throw new TokenExpiredException();
    }

    this.props.updatedAt = now;
  }

  public equals(other: Token): boolean {
    return this.props.code.equals(other.code);
  }

  public toPrimitives(): TokenPrimitives {
    return {
      tokenCode: this.props.code.value,
      sessionId: this.props.sessionId.value,
      credentialId: this.props.credentialId,
      profileCode: this.props.profileCode.value,
      status: this.props.status.value,
      expiresAt: this.props.expiresAt.toISOString(),
      revokedAt: this.props.revokedAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private transitionTo(next: TokenStatus, at: Date): void {
    TokenStateMachine.assertTransition(this.props.status.value, next);

    this.props.status = TokenStatusValue.create(next);

    if (next === TokenStatus.revoked) {
      this.props.revokedAt = at;
    }

    this.props.updatedAt = at;
  }

  private static validateCredentialId(value: number): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InvalidCredentialIdException();
    }

    return value;
  }
}
