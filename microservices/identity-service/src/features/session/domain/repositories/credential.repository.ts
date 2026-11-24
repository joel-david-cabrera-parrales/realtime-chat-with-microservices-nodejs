import { Credential } from "../aggregates/credential.aggregate";
import { CredentialId } from "../value-objects/credential-id.value-object";
import { Username } from "../value-objects/username.value-object";
import { ProfileCode } from "../value-objects/profile-code.value-object";
import { DomainEvent } from "../../../../shared/domain/events/domain-event";
import type { CredentialContact } from "../datasources/credential.datasource";

export abstract class CredentialRepository {
  abstract save(credential: Credential): Promise<DomainEvent[]>;
  abstract findById(id: CredentialId): Promise<Credential | null>;
  abstract findByUsername(username: Username): Promise<Credential | null>;
  abstract findByProfileCode(profileCode: ProfileCode): Promise<Credential | null>;
  abstract existsByUsername(username: Username): Promise<boolean>;
  abstract delete(id: CredentialId): Promise<DomainEvent[]>;
  abstract findContacts(excludeCredentialCode: string, search?: string, limit?: number): Promise<CredentialContact[]>;
}
