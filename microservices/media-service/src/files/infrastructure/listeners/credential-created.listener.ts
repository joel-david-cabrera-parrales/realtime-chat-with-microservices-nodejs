import { ConsumedEvent, ConsumedEventHandler } from "../../../shared/domain/events/event-consumer.service";
import { TypeOrmUserCredentialDataSource } from "../datasources/typeorm-user-credential.datasource";

export interface CredentialCreatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  createdAt: string;
}

export interface UserCreatedEventData {
  credentialCode: string;
  credentialId: number;
  username: string;
  profileCode: string;
  authenticationType: string;
  fullName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  createdAt: string;
}

export class CredentialCreatedListener implements ConsumedEventHandler {
  constructor(private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource) {}

  public async handle(event: ConsumedEvent): Promise<void> {
    if (event.envelope.type === "credential.created") {
      const data = event.envelope.data as CredentialCreatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true);
      console.log(`[media] Credential created locally: ${data.credentialCode}`);
    } else if (event.envelope.type === "user.created") {
      const data = event.envelope.data as UserCreatedEventData;
      await this.userCredentialDataSource.upsert(data.credentialCode, data.username, true, data.fullName, data.email);
      console.log(`[media] User created locally: ${data.credentialCode}`);
    }
  }
}