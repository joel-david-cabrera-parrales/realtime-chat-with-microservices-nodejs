import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialDataSource } from "../../domain/datasources/credential.datasource";
import type { CredentialContact } from "../../domain/datasources/credential.datasource";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { CredentialId } from "../../domain/value-objects/credential-id.value-object";
import { Username } from "../../domain/value-objects/username.value-object";
import { ProfileCode } from "../../domain/value-objects/profile-code.value-object";
import { DomainEvent } from "../../../../shared/domain/events/domain-event";

export class CredentialRepositoryImpl implements CredentialRepository {
  constructor(private readonly credentialDataSource: CredentialDataSource) {}

  public async save(credential: Credential): Promise<DomainEvent[]> {
    await this.credentialDataSource.save(credential);
    return credential.pullEvents();
  }

  public findById(id: CredentialId): Promise<Credential | null> {
    return this.credentialDataSource.findById(id);
  }

  public findByUsername(username: Username): Promise<Credential | null> {
    return this.credentialDataSource.findByUsername(username);
  }

  public findByProfileCode(profileCode: ProfileCode): Promise<Credential | null> {
    return this.credentialDataSource.findByProfileCode(profileCode);
  }

  public existsByUsername(username: Username): Promise<boolean> {
    return this.credentialDataSource.existsByUsername(username);
  }

  public async delete(id: CredentialId): Promise<DomainEvent[]> {
    const credential = await this.credentialDataSource.findById(id);
    if (credential === null) {
      return [];
    }
    credential.markAsDeleted();
    await this.credentialDataSource.save(credential);
    return credential.pullEvents();
  }

  public findContacts(excludeCredentialCode: string, search?: string, limit?: number): Promise<CredentialContact[]> {
    return this.credentialDataSource.findContacts(excludeCredentialCode, search, limit);
  }
}
