import { DomainEvent } from "../../../../shared/domain/events/domain-event";

export interface CredentialDeletedEventPayload {
  credentialCode: string;
  credentialId: number;
  deletedAt: string;
}

export class CredentialDeletedEvent extends DomainEvent {
  public static readonly EVENT_NAME = "credential.deleted";

  private readonly payload: CredentialDeletedEventPayload;

  constructor(props: {
    credentialCode: string;
    credentialId: number;
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
      deletedAt: props.occurredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return CredentialDeletedEvent.EVENT_NAME;
  }

  public toPayload(): CredentialDeletedEventPayload {
    return this.payload;
  }
}