import { ConsumedEvent } from "../../../shared/domain/events/event-consumer.service";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { TypeOrmUserCredentialDataSource } from "../datasources/typeorm-user-credential.datasource";

export interface CredentialUpdatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  updatedAt: string;
}

export interface UserUpdatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  avatarFileCode?: string | null;
  updatedAt: string;
}

export class CredentialUpdatedListener extends DomainEventListener {
  constructor(private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource) {
    super();
  }

  public supports(event: ConsumedEvent): boolean {
    return event.envelope.type === "credential.updated" || event.envelope.type === "user.updated";
  }

  public async onEvent(event: ConsumedEvent): Promise<void> {
    if (event.envelope.type === "credential.updated") {
      const data = event.envelope.data as CredentialUpdatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true);
      console.log(`[notification] Credential updated locally: ${data.credentialCode}`);
    } else if (event.envelope.type === "user.updated") {
      const data = event.envelope.data as UserUpdatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true, data.fullName ?? undefined, data.email ?? undefined);
      console.log(`[notification] User updated locally: ${data.credentialCode}`);
    }
  }
}
