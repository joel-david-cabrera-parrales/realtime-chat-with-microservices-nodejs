import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import { AuthenticationTypeCode } from "../constants/authentication-type.constants";

export interface UserUpdatedEventPayload {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: AuthenticationTypeCode;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  avatarFileCode?: string | null;
  updatedAt: string;
}

export class UserUpdatedEvent extends DomainEvent {
  public static readonly EVENT_NAME = "user.updated";

  private readonly payload: UserUpdatedEventPayload;

  constructor(props: {
    credentialCode: string;
    credentialId: number;
    username: string;
    profileCode: string;
    authenticationType: AuthenticationTypeCode;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    avatarFileCode?: string | null;
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
      fullName: props.fullName ?? null,
      email: props.email ?? null,
      phone: props.phone ?? null,
      birthDate: props.birthDate ?? null,
      gender: props.gender ?? null,
      avatarFileCode: props.avatarFileCode ?? null,
      updatedAt: props.occurredAt.toISOString(),
    };
  }

  public get eventName(): string {
    return UserUpdatedEvent.EVENT_NAME;
  }

  public toPayload(): UserUpdatedEventPayload {
    return this.payload;
  }
}