import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { HashService } from "../../../../shared/domain/services/hash.service";
import { AuthenticationTypeCode } from "../constants/authentication-type.constants";
import { CREDENTIAL_EVENT_NAMES } from "../constants/credential-event.constants";
import { CreateCredentialProps, CredentialPrimitives, CredentialProps, RehydrateCredentialProps } from "../interfaces/credential.interface";
import { CredentialCode } from "../value-objects/credential-code.value-object";
import { CredentialId } from "../value-objects/credential-id.value-object";
import { Password } from "../value-objects/password.value-object";
import { PasswordHash } from "../value-objects/password-hash.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { Username } from "../value-objects/username.value-object";
import { CredentialCreatedEvent } from "../events/credential-created.event";
import { CredentialUpdatedEvent } from "../events/credential-updated.event";
import { CredentialDeletedEvent } from "../events/credential-deleted.event";

export class Credential {
  private readonly events: DomainEvent[] = [];

  private constructor(private readonly props: CredentialProps) {}

  public static create(props: CreateCredentialProps): Credential {
    const now = new Date();

    const credential = new Credential({
      id: CredentialId.new(),
      code: CredentialCode.generate(),
      username: Username.create(props.username),
      passwordHash: props.passwordHash === undefined ? undefined : PasswordHash.create(props.passwordHash),
      profileCode: ProfileCode.create(props.profileCode),
      authenticationType: props.authenticationType ?? AuthenticationTypeCode.default,
      isAuthenticated: false,
      createdAt: now,
      updatedAt: now,
    });

    credential.recordEvent(
      new CredentialCreatedEvent({
        credentialCode: credential.props.code.value,
        credentialId: credential.props.id.value,
        username: credential.props.username.value,
        profileCode: credential.props.profileCode.value,
        authenticationType: credential.props.authenticationType,
        occurredAt: now,
      }),
    );

    return credential;
  }

  public static rehydrate(props: RehydrateCredentialProps): Credential {
    return new Credential({
      id: CredentialId.create(props.credentialId),
      code: CredentialCode.create(props.credentialCode),
      username: Username.create(props.username),
      passwordHash: props.passwordHash === null ? undefined : PasswordHash.create(props.passwordHash),
      profileCode: ProfileCode.create(props.profileCode),
      authenticationType: props.authenticationType ?? AuthenticationTypeCode.default,
      isAuthenticated: props.isAuthenticated,
      createdAt: new Date(props.createdAt.getTime()),
      updatedAt: new Date(props.updatedAt.getTime()),
    });
  }

  public get id(): CredentialId {
    return this.props.id;
  }

  public get code(): CredentialCode {
    return this.props.code;
  }

  public get username(): Username {
    return this.props.username;
  }

  public get profileCode(): ProfileCode {
    return this.props.profileCode;
  }

  public get isAuthenticated(): boolean {
    return this.props.isAuthenticated;
  }

  public get passwordHash(): PasswordHash | undefined {
    return this.props.passwordHash;
  }

  public get authenticationType(): AuthenticationTypeCode {
    return this.props.authenticationType;
  }

  public get createdAt(): Date {
    return new Date(this.props.createdAt.getTime());
  }

  public get updatedAt(): Date {
    return new Date(this.props.updatedAt.getTime());
  }

  public async verifyPassword(password: Password, hashService: HashService): Promise<boolean> {
    const passwordHash = this.props.passwordHash;

    if (passwordHash === undefined) {
      return false;
    }

    return hashService.verifyHash(passwordHash.value, password.value);
  }

  public markAsAuthenticated(now: Date = new Date()): void {
    this.props.isAuthenticated = true;
    this.props.updatedAt = now;
  }

  public updateUsername(username: Username, now: Date = new Date()): void {
    if (this.props.username.equals(username)) {
      return;
    }
    this.props.username = username;
    this.props.updatedAt = now;
    this.recordUpdatedEvent(now);
  }

  public updateProfileCode(profileCode: ProfileCode, now: Date = new Date()): void {
    if (this.props.profileCode.equals(profileCode)) {
      return;
    }
    this.props.profileCode = profileCode;
    this.props.updatedAt = now;
    this.recordUpdatedEvent(now);
  }

  public updateAuthenticationType(authenticationType: AuthenticationTypeCode, now: Date = new Date()): void {
    if (this.props.authenticationType === authenticationType) {
      return;
    }
    this.props.authenticationType = authenticationType;
    this.props.updatedAt = now;
    this.recordUpdatedEvent(now);
  }

  public markAsDeleted(now: Date = new Date()): void {
    this.recordEvent(
      new CredentialDeletedEvent({
        credentialCode: this.props.code.value,
        credentialId: this.props.id.value,
        occurredAt: now,
      }),
    );
  }

  public equals(other: Credential): boolean {
    return this.props.id.equals(other.id);
  }

  public hasEvents(): boolean {
    return this.events.length > 0;
  }

  public pullEvents(): DomainEvent[] {
    const pending = [...this.events];
    this.events.length = 0;
    return pending;
  }

  public toPrimitives(): CredentialPrimitives {
    return {
      credentialId: this.props.id.value,
      credentialCode: this.props.code.value,
      username: this.props.username.value,
      profileCode: this.props.profileCode.value,
      authenticationType: this.props.authenticationType,
      isAuthenticated: this.props.isAuthenticated,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  private recordUpdatedEvent(at: Date): void {
    this.recordEvent(
      new CredentialUpdatedEvent({
        credentialCode: this.props.code.value,
        credentialId: this.props.id.value,
        username: this.props.username.value,
        profileCode: this.props.profileCode.value,
        authenticationType: this.props.authenticationType,
        occurredAt: at,
      }),
    );
  }

  private recordEvent(event: DomainEvent): void {
    this.events.push(event);
  }
}