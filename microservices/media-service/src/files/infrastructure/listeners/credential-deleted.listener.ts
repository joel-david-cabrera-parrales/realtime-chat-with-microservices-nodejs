import { ConsumedEvent, ConsumedEventHandler } from "../../../shared/domain/events/event-consumer.service";
import { TypeOrmUserCredentialDataSource } from "../datasources/typeorm-user-credential.datasource";

export interface CredentialDeletedEventData {
  credentialCode: string;
  credentialId: number;
  deletedAt: string;
}

export class CredentialDeletedListener implements ConsumedEventHandler {
  constructor(private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource) {}

  public async handle(event: ConsumedEvent): Promise<void> {
    if (event.envelope.type !== "credential.deleted") {
      return;
    }
    const data = event.envelope.data as CredentialDeletedEventData;
    await this.userCredentialDataSource.deactivate(data.credentialCode);
    console.log(`[media] Credential deactivated locally: ${data.credentialCode}`);
  }
}