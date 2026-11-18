import { Credential } from "../../domain/aggregates/credential.aggregate";
import { CredentialDataSource } from "../../domain/datasources/credential.datasource";
import type { CredentialContact } from "../../domain/datasources/credential.datasource";
import { CredentialRepository } from "../../domain/repositories/credential.repository";
import { CredentialId } from "../../domain/value-objects/credential-id.value-object";
import { Username } from "../../domain/value-objects/username.value-object";

export class CredentialRepositoryImpl implements CredentialRepository {
  constructor(private readonly credentialDataSource: CredentialDataSource) {}

  public save(credential: Credential): Promise<void> {
    return this.credentialDataSource.save(credential);
  }

  public findById(id: CredentialId): Promise<Credential | null> {
    return this.credentialDataSource.findById(id);
  }

  public findByUsername(username: Username): Promise<Credential | null> {
    return this.credentialDataSource.findByUsername(username);
  }

  public existsByUsername(username: Username): Promise<boolean> {
    return this.credentialDataSource.existsByUsername(username);
  }

  public delete(id: CredentialId): Promise<void> {
    return this.credentialDataSource.delete(id);
  }

  public findContacts(excludeCredentialCode: string, search?: string, limit?: number): Promise<CredentialContact[]> {
    return this.credentialDataSource.findContacts(excludeCredentialCode, search, limit);
  }
}
