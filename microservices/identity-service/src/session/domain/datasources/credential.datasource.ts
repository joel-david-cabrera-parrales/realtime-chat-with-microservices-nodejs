import { Credential } from "../aggregates/credential.aggregate";
import { CredentialId } from "../value-objects/credential-id.value-object";
import { Username } from "../value-objects/username.value-object";

export interface CredentialContact {
  credentialCode: string;
  profileCode: string;
}

export abstract class CredentialDataSource {
  abstract save(credential: Credential): Promise<void>;
  abstract findById(id: CredentialId): Promise<Credential | null>;
  abstract findByUsername(username: Username): Promise<Credential | null>;
  abstract existsByUsername(username: Username): Promise<boolean>;
  abstract delete(id: CredentialId): Promise<void>;
  abstract findContacts(excludeCredentialCode: string, search?: string, limit?: number): Promise<CredentialContact[]>;
}
