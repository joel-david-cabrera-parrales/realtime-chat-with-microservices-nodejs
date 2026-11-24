import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { AuthenticationTypeCode } from "../constants/authentication-type.constants";

export interface UserCreatedEventPayload {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: AuthenticationTypeCode;
  fullName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  createdAt: string;
}

export class UserCreatedEvent extends DomainEvent {
  public static readonly EVENT_NAME = "user.created";

  private readonly payload: UserCreatedEventPayload;

  constructor(props: {
    credentialCode: string;
    credentialId: number;
    username: string;
    profileCode: string;
    authenticationType: AuthenticationTypeCode;
    fullName: string;
    email: string;
    phone?: string | null;
    birthDate?: string | null;
    gender?: string | null;
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
      fullName: props.fullName,
      email: props.email,
      phone: props.phone ?? null,
      birthDate: props.birthDate ?? null,
      gender: props.gender ?? null,
      createdAt: props.occurredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return UserCreatedEvent.EVENT_NAME;
  }

  public toPayload(): UserCreatedEventPayload {
    return this.payload;
  }
}