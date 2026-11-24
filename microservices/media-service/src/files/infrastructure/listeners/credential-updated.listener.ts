import { ConsumedEvent, ConsumedEventHandler } from "../../../shared/domain/events/event-consumer.service";
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

export class CredentialUpdatedListener implements ConsumedEventHandler {
  constructor(private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource) {}

  public async handle(event: ConsumedEvent): Promise<void> {
    if (event.envelope.type === "credential.updated") {
      const data = event.envelope.data as CredentialUpdatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true);
      console.log(`[media] Credential updated locally: ${data.credentialCode}`);
    } else if (event.envelope.type === "user.updated") {
      const data = event.envelope.data as UserUpdatedEventData;
      await this.userCredentialDataSource.upsert(
        data.credentialCode,
        data.username,
        true,
        data.fullName ?? undefined,
        data.email ?? undefined
      );
      console.log(`[media] User updated locally: ${data.credentialCode}`);
    }
  }
}