import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { AuthenticationTypeCode } from "../constants/authentication-type.constants";

export interface CredentialUpdatedEventPayload {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: AuthenticationTypeCode;
  updatedAt: string;
}

export class CredentialUpdatedEvent extends DomainEvent {
  public static readonly EVENT_NAME = "credential.updated";

  private readonly payload: CredentialUpdatedEventPayload;

  constructor(props: {
    credentialCode: string;
    credentialId: number;
    username: string;
    profileCode: string;
    authenticationType: AuthenticationTypeCode;
    occurredAt: Date;
  }) {
    super({
      aggregateId: props.credentialCode,
      eventId: DomainEvent.generateEventId(),
      occurredAt: props.occurredAt,
    });

    this.payload = {
      credentialCode: props.credentialCode,
      credentialId: props.credentialId,
      username: props.username,
      profileCode: props.profileCode,
      authenticationType: props.authenticationType,
      updatedAt: props.occurredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CredentialUpdatedEvent.EVENT_NAME;
  }

  public toPayload(): CredentialUpdatedEventPayload {
    return this.payload;
  }
}