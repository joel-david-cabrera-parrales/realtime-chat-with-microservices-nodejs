import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { AuthenticationTypeCode } from "../constants/authentication-type.constants";

export interface CredentialCreatedEventPayload {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: AuthenticationTypeCode;
  createdAt: string;
}

export class CredentialCreatedEvent extends DomainEvent {
  public static readonly EVENT_NAME = "credential.created";

  private readonly payload: CredentialCreatedEventPayload;

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
      createdAt: props.occurredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CredentialCreatedEvent.EVENT_NAME;
  }

  public toPayload(): CredentialCreatedEventPayload {
    return this.payload;
  }
}
