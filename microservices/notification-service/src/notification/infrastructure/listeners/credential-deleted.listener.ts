import { ConsumedEvent } from "../../../shared/domain/events/event-consumer.service";
import { DomainEventListener } from "../../../shared/domain/events/domain-event-listener";
import { TypeOrmUserCredentialDataSource } from "../datasources/typeorm-user-credential.datasource";

export interface CredentialDeletedEventData {
  credentialCode: string;
  credentialId: number;
  deletedAt: string;
}

export class CredentialDeletedListener extends DomainEventListener {
  constructor(private readonly userCredentialDataSource: TypeOrmUserCredentialDataSource) {
    super();
  }

  public supports(event: ConsumedEvent): boolean {
    return event.envelope.type === "credential.deleted";
  }

  public async onEvent(event: ConsumedEvent): Promise<void> {
    const data = event.envelope.data as CredentialDeletedEventData;
    await this.userCredentialDataSource.deactivate(data.credentialCode);
    console.log(`[notification] Credential deactivated locally: ${data.credentialCode}`);
  }
}